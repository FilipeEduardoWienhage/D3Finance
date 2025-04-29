import csv
from datetime import datetime
from io import StringIO
from fastapi import File, UploadFile, Depends, HTTPException
from d3_finance_api.src.database.database import SessionLocal
from src.app import router
from sqlalchemy.orm import Session
from src.database.models import Receitas, Despesas


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/v1/importar-transacoes", tags=["Importação"])
def importar_transacoes_csv(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not arquivo.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um CSV")

    conteudo = arquivo.file.read().decode("utf-8")
    leitor = csv.DictReader(StringIO(conteudo))
    receitas, despesas = 0, 0

    for linha in leitor:
        tipo = linha.get("tipo", "").strip().lower()
        try:
            if tipo == "receita":
                nova = Receitas(
                    categoria=linha["categoria"],
                    nome_receita=linha["nome"],
                    valor_recebido=float(linha["valor"]),
                    data_recebimento=datetime.strptime(linha["data"], "%Y-%m-%d").date(),
                    forma_recebimento=linha["forma"],
                    descricao=linha.get("descricao")
                )
                db.add(nova)
                receitas += 1

            elif tipo == "despesa":
                nova = Despesas(
                    categoria=linha["categoria"],
                    nome_despesa=linha["nome"],
                    valor_pago=float(linha["valor"]),
                    data_pagamento=datetime.strptime(linha["data"], "%Y-%m-%d").date(),
                    forma_pagamento=linha["forma"],
                    descricao=linha.get("descricao")
                )
                db.add(nova)
                despesas += 1
            else:
                raise ValueError(f"Tipo inválido: {tipo}")

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro na linha: {linha}. Erro: {str(e)}")

    db.commit()
    return {"mensagem": f"{receitas} receitas e {despesas} despesas importadas com sucesso."}