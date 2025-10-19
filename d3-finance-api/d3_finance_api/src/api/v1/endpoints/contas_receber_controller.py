from datetime import date, datetime
from typing import List, Annotated, Optional
from fastapi import HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from src.app import router
from src.database.database import SessionLocal
from src.database.models import ContasReceber, Contas, Usuario, Receitas
from src.api.tags import Tag
from src.schemas.contas_receber_schemas import (
    ContaReceberCreate, ContaReceberUpdate, ContaReceberResponse, 
    ContaReceberPaginatedResponse
)
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
import logging

logger = logging.getLogger(__name__)

LISTA_CONTAS_RECEBER = "/v1/contas-receber"
LISTA_CONTAS_RECEBER_PAGINADO = "/v1/contas-receber/paginado"
CRIAR_CONTA_RECEBER = "/v1/contas-receber"
ATUALIZAR_CONTA_RECEBER = "/v1/contas-receber/{conta_id}"
DELETAR_CONTA_RECEBER = "/v1/contas-receber/{conta_id}"
MARCAR_COMO_PAGA = "/v1/contas-receber/{conta_id}/receber"


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
    db: Session = Depends(get_db)
):
    """
    Lista todas as contas a receber do usuário
    """
    contas = db.query(ContasReceber).filter(
        ContasReceber.usuario_id == usuario_logado.id
    ).order_by(ContasReceber.data_prevista.asc()).all()

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
    ) for cr in contas]


@router.get(
    path=LISTA_CONTAS_RECEBER_PAGINADO,
    response_model=ContaReceberPaginatedResponse,
    tags=[Tag.ContasReceber.name]
)
def get_contas_receber_paginado(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(10, ge=1, le=100, description="Itens por página")
):
    """
    Lista contas a receber com paginação
    """
    query = db.query(ContasReceber).filter(
        ContasReceber.usuario_id == usuario_logado.id
    ).order_by(ContasReceber.data_prevista.asc())

    total = query.count()
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    return ContaReceberPaginatedResponse(
        items=[ContaReceberResponse(
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
        ) for cr in items],
        total=total,
        page=page,
        size=size
    )


@router.post(
    path=CRIAR_CONTA_RECEBER,
    response_model=ContaReceberResponse,
    status_code=status.HTTP_201_CREATED,
    tags=[Tag.ContasReceber.name]
)
def criar_conta_receber(
    conta_receber: ContaReceberCreate,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Cria uma nova conta a receber
    """
    # Verificar se a conta existe e pertence ao usuário
    conta = db.query(Contas).filter(
        and_(
            Contas.id == conta_receber.conta_id,
            Contas.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )

    try:
        nova_conta = ContasReceber(
            valor=conta_receber.valor,
            data_prevista=conta_receber.data_prevista,
            categoria_receita=conta_receber.categoria_receita,
            forma_recebimento=conta_receber.forma_recebimento,
            conta_id=conta_receber.conta_id,
            descricao=conta_receber.descricao,
            status="Pendente",  # Sempre inicia como Pendente
            usuario_id=usuario_logado.id
        )

        db.add(nova_conta)
        db.commit()
        db.refresh(nova_conta)

        return ContaReceberResponse(
            id=nova_conta.id,
            descricao=nova_conta.descricao,
            valor=nova_conta.valor,
            data_prevista=nova_conta.data_prevista,
            categoria_receita=nova_conta.categoria_receita,
            forma_recebimento=nova_conta.forma_recebimento,
            status=nova_conta.status,
            conta_id=nova_conta.conta_id,
            data_criacao=nova_conta.data_criacao,
            data_alteracao=nova_conta.data_alteracao
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar conta a receber"
        )


@router.put(
    path=ATUALIZAR_CONTA_RECEBER,
    response_model=ContaReceberResponse,
    tags=[Tag.ContasReceber.name]
)
def atualizar_conta_receber(
    conta_id: int,
    conta_receber_update: ContaReceberUpdate,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    
    conta = db.query(ContasReceber).filter(
        and_(
            ContasReceber.id == conta_id,
            ContasReceber.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada"
        )

    # Verificar se a nova conta existe e pertence ao usuário
    if conta_receber_update.conta_id:
        nova_conta = db.query(Contas).filter(
            and_(
                Contas.id == conta_receber_update.conta_id,
                Contas.usuario_id == usuario_logado.id
            )
        ).first()

        if not nova_conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conta não encontrada"
            )

    # Atualizar apenas os campos fornecidos
    update_data = conta_receber_update.__dict__
    update_data = {k: v for k, v in update_data.items() if v is not None}

    for field, value in update_data.items():
        setattr(conta, field, value)

    conta.data_alteracao = datetime.now()

    try:
        db.commit()
        db.refresh(conta)

        return ContaReceberResponse(
            id=conta.id,
            descricao=conta.descricao,
            valor=conta.valor,
            data_prevista=conta.data_prevista,
            categoria_receita=conta.categoria_receita,
            forma_recebimento=conta.forma_recebimento,
            status=conta.status,
            conta_id=conta.conta_id,
            data_criacao=conta.data_criacao,
            data_alteracao=conta.data_alteracao
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar conta a receber"
        )


@router.delete(
    path=DELETAR_CONTA_RECEBER,
    status_code=status.HTTP_204_NO_CONTENT,
    tags=[Tag.ContasReceber.name]
)
def deletar_conta_receber(
    conta_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Deleta uma conta a receber
    """
    conta = db.query(ContasReceber).filter(
        and_(
            ContasReceber.id == conta_id,
            ContasReceber.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada"
        )

    db.delete(conta)
    db.commit()


@router.put(
    path=MARCAR_COMO_PAGA,
    response_model=ContaReceberResponse,
    tags=[Tag.ContasReceber.name]
)
def marcar_conta_como_paga(
    conta_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
   
    conta = db.query(ContasReceber).filter(
        and_(
            ContasReceber.id == conta_id,
            ContasReceber.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a receber não encontrada"
        )

    if conta.status == "Pago":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta já está marcada como paga"
        )

    conta.status = "Pago"
    conta.data_alteracao = datetime.now()

    conta_bancaria = db.query(Contas).filter(
        and_(
            Contas.id == conta.conta_id,
            Contas.usuario_id == usuario_logado.id
        )
    ).first()

    if conta_bancaria:
        conta_bancaria.saldo += conta.valor
        conta_bancaria.data_alteracao = datetime.now()

    receita = Receitas(
        categoria=conta.categoria_receita,
        valor_recebido=conta.valor,
        data_recebimento=date.today(),
        descricao=conta.descricao,
        forma_recebimento=conta.forma_recebimento,
        conta_id=conta.conta_id,
        usuario_id=usuario_logado.id
    )
    db.add(receita)

    try:
        db.commit()
        db.refresh(conta)   

        return ContaReceberResponse(
            id=conta.id,
            descricao=conta.descricao,
            valor=conta.valor,
            data_prevista=conta.data_prevista,
            categoria_receita=conta.categoria_receita,
            forma_recebimento=conta.forma_recebimento,
            status=conta.status,
            conta_id=conta.conta_id,
            data_criacao=conta.data_criacao,
            data_alteracao=conta.data_alteracao
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao marcar conta como paga"
        )