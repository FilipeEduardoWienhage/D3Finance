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
from src.schemas.contas_pagar_schemas import ContaPagarCreate, ContaPagarPaginatedResponse, ContaPagarUpdate, ContaPagarResponse, PaginatedContaPagarResponse
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
        forma_recebimento=cp.forma_recebimento,
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
        ContasPagar.usuario.id == usuario_logado.id
    ).order_by(ContasPagar.data_vencimento.asc())

    total = query.count()
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    return ContaPagarPaginatedResponse(
        items=[ContaPagarResponse]
    )