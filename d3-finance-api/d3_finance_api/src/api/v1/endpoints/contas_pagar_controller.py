from datetime import date, datetime
from typing import List, Annotated, Optional
from fastapi import HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from src.app import router
from src.database.database import SessionLocal
from src.database.models import ContasPagar, Contas, Usuario, Despesas
from src.api.tags import Tag
from src.schemas.contas_pagar_schemas import ContaPagarCreate, ContaPagarPaginatedResponse, ContaPagarUpdate, ContaPagarResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
import logging

logger = logging.getLogger(__name__)

LISTA_CONTAS_PAGAR = "/v1/contas-pagar"
LISTA_CONTA_PAGAR_PAGINADO = "/v1/contas-pagar/paginado"
CRIAR_CONTA_PAGAR = "/v1/contas-pagar"
ATUALIZAR_CONTA_PAGAR = "/v1/contas-pagar/{conta_id}"
DELETAR_CONTA_PAGAR = "/v1/contas-pagar/{conta_id}"
MARCAR_COMO_PAGA = "/v1/contas-pagar/{contas_id}/pagar"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
@router.get(
    path=LISTA_CONTAS_PAGAR,
    response_model=List[ContaPagarResponse],
    tags=[Tag.ContasPagar.name]
)
def get_contas_pagar(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    
    #Lista as contas a pagar do usuario

    contas = db.query(ContasPagar).filter(
        ContasPagar.usuario_id == usuario_logado.id
    ).order_by(ContasPagar.data_vencimento.asc()).all()

    return [ContaPagarResponse(
        id=cp.id,
        descricao=cp.descricao,
        valor=cp.valor,
        data_vencimento=cp.data_vencimento,
        categoria_despesa=cp.categoria_despesa,
        forma_pagamento=cp.forma_recebimento,
        status=cp.status,
        conta_id=cp.conta_id,
        data_criacao=cp.data_criacao,
        data_alteracao=cp.data_alteracao
    ) for cp in contas]


@router.get(
    path=LISTA_CONTA_PAGAR_PAGINADO,
    response_model=ContaPagarPaginatedResponse,
    tags=[Tag.ContasPagar.name]
)
def get_contas_pagar_paginado(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(10, ge=1, le=100, description="Itens por página")
):
    
    # Listar contas a pagar com paginacao

    query = db.query(ContasPagar).filter(
        ContasPagar.usuario_id == usuario_logado.id
    ).order_by(ContasPagar.data_vencimento.asc())

    total = query.count()
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    return ContaPagarPaginatedResponse(
        items=[ContaPagarResponse(
            id=cp.id,
            descricao=cp.descricao,
            valor=cp.valor,
            data_vencimento=cp.data_vencimento,
            categoria_despesa=cp.categoria_despesa,
            forma_pagamento=cp.forma_recebimento,
            status=cp.status,
            conta_id=cp.conta_id,
            data_criacao=cp.data_criacao,
            data_alteracao=cp.data_alteracao
        ) for cp in items],
        total=total,
        page=page,
        size=size
    )

@router.post(
    path=CRIAR_CONTA_PAGAR,
    response_model=ContaPagarResponse,
    status_code=status.HTTP_201_CREATED,
    tags=[Tag.ContasPagar.name]
)
def create_conta_pagar(
    conta_pagar: ContaPagarCreate,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    conta = db.query(Contas).filter(
        and_(
            Contas.id == conta_pagar.conta_id,
            Contas.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )

    try:
        nova_conta = ContasPagar(
            valor=conta_pagar.valor,
            data_vencimento=conta_pagar.data_vencimento,
            categoria_despesa=conta_pagar.categoria_despesa,
            # schema usa forma_pagamento, modelo usa forma_recebimento
            forma_recebimento=conta_pagar.forma_pagamento,
            conta_id=conta_pagar.conta_id,
            descricao=conta_pagar.descricao,
            status="Pendente",  # Sempre inicia como Pendente
            usuario_id=usuario_logado.id
        )

        db.add(nova_conta)
        db.commit()
        db.refresh(nova_conta)

        return ContaPagarResponse(
            id=nova_conta.id,
            descricao=nova_conta.descricao,
            valor=nova_conta.valor,
            data_vencimento=nova_conta.data_vencimento,
            categoria_despesa=nova_conta.categoria_despesa,
            # schema espera forma_pagamento
            forma_pagamento=nova_conta.forma_recebimento,
            status=nova_conta.status,
            conta_id=nova_conta.conta_id,
            data_criacao=nova_conta.data_criacao,
            data_alteracao=nova_conta.data_alteracao
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar conta a pagar"
        )
    

@router.put(
    path=ATUALIZAR_CONTA_PAGAR,
    response_model=ContaPagarResponse,
    tags=[Tag.ContasPagar.name]

)
def atualizar_conta_pagar(
    conta_id: int,
    conta_pagar_update: ContaPagarUpdate,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    conta = db.query(ContasPagar).filter(
        and_(
            ContasPagar.id == conta_id,
            ContasPagar.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a pagar não encontrada"
        )

    # Verificar se a nova conta existe e pertence ao usuário
    if conta_pagar_update.conta_id:
        nova_conta = db.query(Contas).filter(
            and_(
                Contas.id == conta_pagar_update.conta_id,
                Contas.usuario_id == usuario_logado.id
            )
        ).first()

        if not nova_conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conta não encontrada"
            )

    # Atualizar apenas os campos fornecidos
    update_data = conta_pagar_update.__dict__
    update_data = {k: v for k, v in update_data.items() if v is not None}

    for field, value in update_data.items():
        if field == 'forma_pagamento':
            setattr(conta, 'forma_recebimento', value)
        else:
            setattr(conta, field, value)

    conta.data_alteracao = datetime.now()

    try:
        db.commit()
        db.refresh(conta)

        return ContaPagarResponse(
            id=conta.id,
            descricao=conta.descricao,
            valor=conta.valor,
            data_vencimento=conta.data_vencimento,
            categoria_despesa=conta.categoria_despesa,
            forma_pagamento=conta.forma_recebimento,
            status=conta.status,
            conta_id=conta.conta_id,
            data_criacao=conta.data_criacao,
            data_alteracao=conta.data_alteracao
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar conta a pagar"
        )
    
    

@router.put(
    path=MARCAR_COMO_PAGA,
    response_model=ContaPagarResponse,
    tags=[Tag.ContasPagar.name]
)
def marcar_conta_como_paga(
    contas_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    conta = db.query(ContasPagar).filter(
        and_(
            ContasPagar.id == contas_id,
            ContasPagar.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a pagar não encontrada"
        )

    if conta.status == "Pago":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta já foi paga"
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
        conta_bancaria.saldo -= conta.valor
        conta_bancaria.data_alteracao = datetime.now()

    despesa = Despesas(
        forma_pagamento=conta.forma_recebimento,
        conta_id=conta.conta_id,
        descricao=conta.descricao,
        valor_pago=conta.valor,
        categoria=conta.categoria_despesa,
        data_pagamento=datetime.now().date(),
        usuario_id=usuario_logado.id
    )
    db.add(despesa)

    try:
        db.commit()
        db.refresh(conta)   

        return ContaPagarResponse(
            id=conta.id,
            descricao=conta.descricao,
            valor=conta.valor,
            data_vencimento=conta.data_vencimento,
            categoria_despesa=conta.categoria_despesa,
            forma_pagamento=conta.forma_recebimento,
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

@router.delete(
    path=DELETAR_CONTA_PAGAR,
    status_code=status.HTTP_204_NO_CONTENT,
    tags=[Tag.ContasPagar.name]
)
def deletar_conta_pagar(
    conta_id: int,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    conta = db.query(ContasPagar).filter(
        and_(
            ContasPagar.id == conta_id,
            ContasPagar.usuario_id == usuario_logado.id
        )
    ).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta a pagar não encontrada"
        )

    db.delete(conta)
    db.commit()

    return {"message": "Conta a pagar deletada com sucesso"}