import csv
import logging
from datetime import datetime
from io import StringIO
from typing import Annotated
from fastapi import File, UploadFile, Depends, HTTPException
from src.database.database import SessionLocal
from src.app import router
from sqlalchemy.orm import Session
from src.database.models import Receitas, Despesas, Contas
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData

logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/v1/importar-transacoes", tags=["Importação"])
def importar_transacoes_csv(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa transações de um arquivo CSV
    """
    logger.info(f"Iniciando importação para usuário {usuario_logado.id}")
    
    if not arquivo.filename or not arquivo.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um CSV")

    try:
        conteudo = arquivo.file.read().decode("utf-8")
        logger.info(f"Arquivo lido com sucesso: {len(conteudo)} caracteres")
    except UnicodeDecodeError:
        try:
            arquivo.file.seek(0)  
            conteudo = arquivo.file.read().decode("latin1")
            logger.info(f"Arquivo lido com encoding latin1: {len(conteudo)} caracteres")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Erro ao decodificar o arquivo CSV. Use UTF-8 ou Latin1.")

    try:
        leitor = csv.DictReader(StringIO(conteudo))
        colunas_esperadas = ["tipo", "conta_nome", "categoria", "valor", "data"]
        
        if leitor.fieldnames is None:
            raise HTTPException(status_code=400, detail="Não foi possível ler as colunas do CSV")
        
        if not all(coluna in leitor.fieldnames for coluna in colunas_esperadas):
            raise HTTPException(
                status_code=400, 
                detail=f"Colunas obrigatórias não encontradas. Esperadas: {colunas_esperadas}"
            )
        
        logger.info(f"Colunas encontradas: {leitor.fieldnames}")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao ler CSV: {str(e)}")

    receitas_processadas = 0
    despesas_processadas = 0
    erros = []
    transacoes_validas = []

    for linha_num, linha in enumerate(leitor, 1):
        logger.info(f"Processando linha {linha_num}: {linha}")
        
        try:
            tipo = linha.get("tipo", "").strip().lower()
            conta_nome = linha.get("conta_nome", "").strip()
            categoria = linha.get("categoria", "").strip()
            valor_str = linha.get("valor", "").strip()
            data_str = linha.get("data", "").strip()
            
            if tipo not in ["receita", "despesa"]:
                raise ValueError(f"Tipo inválido: '{tipo}'. Deve ser 'receita' ou 'despesa'")
            
            if not conta_nome:
                raise ValueError("Campo 'conta_nome' é obrigatório")
            
            if not categoria:
                raise ValueError("Campo 'categoria' é obrigatório")
            
            if not valor_str:
                raise ValueError("Campo 'valor' é obrigatório")
            
            try:
                valor = float(valor_str.replace(",", "."))
                if valor <= 0:
                    raise ValueError("Valor deve ser maior que zero")
            except ValueError:
                raise ValueError(f"Valor inválido: '{valor_str}'")
            
            if not data_str:
                raise ValueError("Campo 'data' é obrigatório")
            
            try:
                data = datetime.strptime(data_str, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError(f"Data inválida: '{data_str}'. Use formato YYYY-MM-DD")
            
            conta = db.query(Contas).filter(
                Contas.nome_conta == conta_nome,
                Contas.usuario_id == usuario_logado.id
            ).first()
            
            if not conta:
                raise ValueError(f"Conta '{conta_nome}' não encontrada para o usuário logado")
            
            forma = linha.get("forma", "").strip() or None
            descricao = linha.get("descricao", "").strip() or None
            
            if tipo == "receita":
                transacao = Receitas(
                    categoria=categoria,
                    valor_recebido=valor,
                    data_recebimento=data,
                    forma_recebimento=forma or "Não informado",
                    conta_id=conta.id,
                    usuario_id=usuario_logado.id,
                    descricao=descricao
                )
                receitas_processadas += 1
                logger.info(f"Receita criada: {categoria} - R$ {valor}")
                
            else: 
                transacao = Despesas(
                    categoria=categoria,
                    valor_pago=valor,
                    data_pagamento=data,
                    forma_pagamento=forma or "Não informado",
                    conta_id=conta.id,
                    usuario_id=usuario_logado.id,
                    descricao=descricao
                )
                despesas_processadas += 1
                logger.info(f"Despesa criada: {categoria} - R$ {valor}")
            
            transacoes_validas.append((transacao, conta, tipo, valor))
            
        except Exception as e:
            erro_msg = f"Linha {linha_num}: {str(e)}"
            logger.error(erro_msg)
            erros.append(erro_msg)

    if transacoes_validas:
        try:
            logger.info(f"Salvando {len(transacoes_validas)} transações no banco...")
            
            for transacao, conta, tipo, valor in transacoes_validas:
                db.add(transacao)
                
                saldo_atual = conta.saldo or 0.0
                if tipo == "receita":
                    conta.saldo = saldo_atual + valor
                    logger.info(f"Saldo da conta {conta.nome_conta}: {saldo_atual} -> {conta.saldo}")
                else:
                    conta.saldo = saldo_atual - valor
                    logger.info(f"Saldo da conta {conta.nome_conta}: {saldo_atual} -> {conta.saldo}")
            
            db.commit()
            logger.info("Commit realizado com sucesso!")
            
        except Exception as e:
            logger.error(f"Erro ao salvar no banco: {e}")
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco: {str(e)}")
    else:
        logger.warning("Nenhuma transação válida encontrada")
        db.rollback()

    resultado = {
        "mensagem": f"{receitas_processadas} receitas e {despesas_processadas} despesas importadas com sucesso.",
        "erros": erros,
        "resumo": {
            "receitas_processadas": receitas_processadas,
            "despesas_processadas": despesas_processadas,
            "total_erros": len(erros),
            "total_linhas_processadas": receitas_processadas + despesas_processadas + len(erros)
        }
    }
    
    logger.info(f"Importação concluída: {resultado['resumo']}")
    return resultado
