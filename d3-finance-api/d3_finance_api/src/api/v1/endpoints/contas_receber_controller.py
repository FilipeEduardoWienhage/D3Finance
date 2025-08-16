from datetime import date, datetime
from typing import List, Annotated, Optional
from fastapi import HTTPException, Depends, status, Response, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.app import router
from src.database.database import SessionLocal
from src.database.models import ContasReceber, Contas, Receitas
from src.api.tags import Tag
from src.schemas.contas_receber_schemas import ContaReceberCreate, ContaReceberUpdate, ContaReceberResponse, ContaReceberCategoriaResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.utils.notification_utils import send_notification_background
from src.services.telegram_service import telegram_service
import logging

# Configuração de logging
logger = logging.getLogger(__name__)

# Endpoints
LISTA_CONTAS_RECEBER = "/v1/contas-receber"
CADASTRO_CONTAS_RECEBER = "/v1/contas-receber"
ATUALIZAR_CONTAS_RECEBER = "/v1/contas-receber/{conta_receber_id}"
APAGAR_CONTAS_RECEBER = "/v1/contas-receber/{conta_receber_id}"
OBTER_POR_ID_CONTAS_RECEBER = "/v1/contas-receber/{conta_receber_id}"
CONFIRMAR_RECEBIMENTO = "/v1/contas-receber/{conta_receber_id}/confirmar"
CONSOLIDADO_CONTAS_RECEBER = "/v1/contas-receber/consolidado"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=LISTA_CONTAS_RECEBER,
    response_model=List[ContaReceberResponse],
    tags=[Tag.ContasReceber.name]
)
def get_contas_receber(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoria")
):
    """
    Lista todas as contas a receber do usuário com filtros opcionais
    """
    query = db.query(ContasReceber).filter(
        ContasReceber.usuario_id == usuario_logado.id
    )
    
    if status:
        query = query.filter(ContasReceber.status == status)
    
    if data_inicio:
        query = query.filter(ContasReceber.data_prevista >= data_inicio)
    
    if data_fim:
        query = query.filter(ContasReceber.data_prevista <= data_fim)
    
    if categoria:
        query = query.filter(ContasReceber.categoria_receita == categoria)
    
    contas_receber = query.order_by(ContasReceber.data_prevista).all()
    
    return [ContaReceberResponse(
        id=cr.id,
        descricao=cr.descricao,
        valor=cr.valor,
        data_prevista=cr.data_prevista,
        categoria_receita=cr.categoria_receita,
        forma_recebimento=cr.forma_recebimento,
        status=cr.status,
        conta_id=cr.conta_id,
        data_criacao=cr.data_criacao,
        data_alteracao=cr.data_alteracao
    ) for cr in contas_receber]


@router.get(
    path=CONSOLIDADO_CONTAS_RECEBER,
    response_model=List[ContaReceberCategoriaResponse],
    tags=[Tag.ContasReceber.name]
)
def get_contas_receber_consolidadas(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None, description="Filtrar por status")
):
    """
    Retorna contas a receber consolidadas por categoria
    """
    from sqlalchemy import func
    
    query = db.query(
        ContasReceber.categoria_receita,
        func.sum(ContasReceber.valor).label('total_valor'),
        func.count(ContasReceber.id).label('quantidade')
    ).filter(ContasReceber.usuario_id == usuario_logado.id)
    
    if status:
        query = query.filter(ContasReceber.status == status)
    
    resultado = query.group_by(ContasReceber.categoria_receita).all()
    
    return [ContaReceberCategoriaResponse(
        categoria=item.categoria_receita,
        total_valor=float(item.total_valor),
        quantidade=item.quantidade
    ) for item in resultado]


@router.get(
    path=OBTER_POR_ID_CONTAS_RECEBER,
    response_model=ContaReceberResponse,
    tags=[Tag.ContasReceber.name]
)
def get_conta_receber_by_id(
    conta_receber_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Obtém uma conta a receber específica por ID
    """
    conta_receber = db.query(ContasReceber).filter(
        ContasReceber.id == conta_receber_id,
        ContasReceber.usuario_id == usuario_logado.id
    ).first()
    
    if not conta_receber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada ou não pertence ao usuário"
        )
    
    return ContaReceberResponse(
        id=conta_receber.id,
        descricao=conta_receber.descricao,
        valor=conta_receber.valor,
        data_prevista=conta_receber.data_prevista,
        categoria_receita=conta_receber.categoria_receita,
        forma_recebimento=conta_receber.forma_recebimento,
        status=conta_receber.status,
        conta_id=conta_receber.conta_id,
        data_criacao=conta_receber.data_criacao,
        data_alteracao=conta_receber.data_alteracao
    )


@router.post(
    path=CADASTRO_CONTAS_RECEBER,
    response_model=ContaReceberResponse,
    tags=[Tag.ContasReceber.name]
)
def create_conta_receber(
    conta_receber: ContaReceberCreate,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Cria uma nova conta a receber
    """
    # Validação de data prevista (deve ser futura)
    if conta_receber.data_prevista <= date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data prevista deve ser futura"
        )
    
    # Validação de valor (deve ser positivo)
    if conta_receber.valor <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O valor deve ser maior que zero"
        )
    
    # Validação de conta (deve pertencer ao usuário)
    conta = db.query(Contas).filter(
        Contas.id == conta_receber.conta_id,
        Contas.usuario_id == usuario_logado.id
    ).first()
    
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada ou não pertence ao usuário"
        )
    
    
    status_validos = ["PENDENTE", "RECEBIDO", "CANCELADO"]
    if conta_receber.status and conta_receber.status not in status_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status inválido. Valores permitidos: PENDENTE, RECEBIDO, CANCELADO"
        )
    
    db_conta_receber = ContasReceber(
        descricao=conta_receber.descricao,
        valor=conta_receber.valor,
        data_prevista=conta_receber.data_prevista,
        categoria_receita=conta_receber.categoria_receita,
        forma_recebimento=conta_receber.forma_recebimento,
        status="PENDENTE",  
        conta_id=conta_receber.conta_id,
        usuario_id=usuario_logado.id
    )
    
    try:
        db.add(db_conta_receber)
        db.commit()
        db.refresh(db_conta_receber)
        
        logger.info(f"Usuário {usuario_logado.id} criou conta a receber {db_conta_receber.id}")
        
        return ContaReceberResponse(
            id=db_conta_receber.id,
            descricao=db_conta_receber.descricao,
            valor=db_conta_receber.valor,
            data_prevista=db_conta_receber.data_prevista,
            categoria_receita=db_conta_receber.categoria_receita,
            forma_recebimento=db_conta_receber.forma_recebimento,
            status=db_conta_receber.status,
            conta_id=db_conta_receber.conta_id,
            data_criacao=db_conta_receber.data_criacao,
            data_alteracao=db_conta_receber.data_alteracao
        )
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar conta a receber"
        )


@router.put(
    path=ATUALIZAR_CONTAS_RECEBER,
    response_model=ContaReceberResponse,
    tags=[Tag.ContasReceber.name]
)
def update_conta_receber(
    conta_receber_id: int,
    conta_receber_update: ContaReceberUpdate,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Atualiza uma conta a receber existente
    """
    conta_receber = db.query(ContasReceber).filter(
        ContasReceber.id == conta_receber_id,
        ContasReceber.usuario_id == usuario_logado.id
    ).first()
    
    if not conta_receber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada ou não pertence ao usuário"
        )
    
    if conta_receber.status == "RECEBIDO":
        if conta_receber_update.valor or conta_receber_update.data_prevista:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível alterar valor ou data de uma conta já confirmada"
            )
    

    if conta_receber_update.data_prevista and conta_receber_update.data_prevista <= date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data prevista deve ser futura"
        )
    
    if conta_receber_update.valor and conta_receber_update.valor <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O valor deve ser maior que zero"
        )
    
    if conta_receber_update.conta_id:
        conta = db.query(Contas).filter(
            Contas.id == conta_receber_update.conta_id,
            Contas.usuario_id == usuario_logado.id
        ).first()
        
        if not conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conta não encontrada ou não pertence ao usuário"
            )
    
    if conta_receber_update.status:
        status_validos = ["PENDENTE", "RECEBIDO", "CANCELADO"]
        if conta_receber_update.status not in status_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status inválido. Valores permitidos: PENDENTE, RECEBIDO, CANCELADO"
            )
    
    for field, value in conta_receber_update.__dict__.items():
        if value is not None:
            setattr(conta_receber, field, value)
    
    try:
        db.commit()
        db.refresh(conta_receber)
        
        logger.info(f"Usuário {usuario_logado.id} atualizou conta a receber {conta_receber_id}")
        
        return ContaReceberResponse(
            id=conta_receber.id,
            descricao=conta_receber.descricao,
            valor=conta_receber.valor,
            data_prevista=conta_receber.data_prevista,
            categoria_receita=conta_receber.categoria_receita,
            forma_recebimento=conta_receber.forma_recebimento,
            status=conta_receber.status,
            conta_id=conta_receber.conta_id,
            data_criacao=conta_receber.data_criacao,
            data_alteracao=conta_receber.data_alteracao
        )
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar conta a receber"
        )


@router.put(
    path=CONFIRMAR_RECEBIMENTO,
    response_model=ContaReceberResponse,
    tags=[Tag.ContasReceber.name]
)
def confirmar_recebimento(
    conta_receber_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Confirma o recebimento de uma conta a receber
    """
    conta_receber = db.query(ContasReceber).filter(
        ContasReceber.id == conta_receber_id,
        ContasReceber.usuario_id == usuario_logado.id
    ).first()
    
    if not conta_receber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada"
        )
    
    if conta_receber.status == "RECEBIDO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta conta a receber já foi confirmada"
        )
    
    if conta_receber.status == "CANCELADO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível confirmar uma conta cancelada"
        )
    
    try:
        conta_receber.status = "RECEBIDO"
        
        conta = db.query(Contas).filter(Contas.id == conta_receber.conta_id).first()
        if not conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conta associada não encontrada"
            )
        
        nova_receita = Receitas(
            categoria=conta_receber.categoria_receita,
            valor_recebido=conta_receber.valor,
            data_recebimento=date.today(),
            descricao=f"Recebimento confirmado: {conta_receber.descricao}",
            forma_recebimento=conta_receber.forma_recebimento,
            conta_id=conta_receber.conta_id,
            usuario_id=usuario_logado.id
        )
        
        conta.saldo += conta_receber.valor
        
        # Salvar no banco
        db.add(nova_receita)
        db.commit()
        
        # Enviar notificação
        send_notification_background("receita", db, receita=nova_receita)
        
        try:
            telegram_service.notify_receita_cadastrada(
                usuario_id=usuario_logado.id,
                categoria=conta_receber.categoria_receita,
                valor=conta_receber.valor,
                descricao=f"Recebimento confirmado: {conta_receber.descricao}",
                data_recebimento=date.today().strftime("%d/%m/%Y"),
                conta_nome=conta.nome_conta
            )
        except Exception as e:
            logger.error(f"Erro ao enviar notificação do Telegram: {e}")
        
        logger.info(f"Usuário {usuario_logado.id} confirmou recebimento da conta {conta_receber_id}")
        
        return ContaReceberResponse(
            id=conta_receber.id,
            descricao=conta_receber.descricao,
            valor=conta_receber.valor,
            data_prevista=conta_receber.data_prevista,
            categoria_receita=conta_receber.categoria_receita,
            forma_recebimento=conta_receber.forma_recebimento,
            status=conta_receber.status,
            conta_id=conta_receber.conta_id,
            data_criacao=conta_receber.data_criacao,
            data_alteracao=conta_receber.data_alteracao
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao confirmar recebimento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao confirmar recebimento"
        )


@router.delete(
    path=APAGAR_CONTAS_RECEBER,
    tags=[Tag.ContasReceber.name]
)
def delete_conta_receber(
    conta_receber_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Exclui uma conta a receber
    """
    conta_receber = db.query(ContasReceber).filter(
        ContasReceber.id == conta_receber_id,
        ContasReceber.usuario_id == usuario_logado.id
    ).first()
    
    if not conta_receber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada ou não pertence ao usuário"
        )
    
    # Não permitir excluir contas já confirmadas
    if conta_receber.status == "RECEBIDO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir uma conta a receber já confirmada"
        )
    
    try:
        db.delete(conta_receber)
        db.commit()
        
        logger.info(f"Usuário {usuario_logado.id} excluiu conta a receber {conta_receber_id}")
        
        return {"message": "Conta a receber excluída com sucesso"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir conta a receber: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir conta a receber"
        )