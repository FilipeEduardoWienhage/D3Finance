from datetime import datetime
from typing import List, Optional, Annotated
from fastapi import HTTPException, Depends, Query, status, Response
from sqlalchemy import extract, func
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Despesas, Contas
from src.api.tags import Tag
from src.schemas.despesa_schemas import DespesaCategoriaResponse, DespesaCreate, DespesaUpdate, DespesaResponse, DespesaMensalResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.utils.notification_utils import send_notification_background
from src.services.telegram_service import telegram_service


LISTA_DESPESAS = "/v1/despesas"
CONSOLIDADO_DESPESAS = "/v1/despesas/consolidado"
CONSOLIDADO_MENSAL_DESPESAS = "/v1/despesas/consolidado/mensal"
OBTER_POR_ID_DESPESAS = "/v1/despesas/{despesas_id}"
CADASTRO_DESPESAS = "/v1/despesas"
ATUALIZAR_DESPESAS = "/v1/despesas/{despesas_id}"
APAGAR_DESPESAS = "/v1/despesas/{despesas_id}"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=CONSOLIDADO_MENSAL_DESPESAS,
    response_model=List[DespesaMensalResponse],
    tags=[Tag.Despesas.name]
)
def get_despesas_consolidadas_mensal(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: Optional[int] = Query(None, description="Filtra as despesas pelo ano. Se não for fornecido, usa o ano atual."),
    categoria: Optional[str] = Query(None, description="Filtra as despesas por uma categoria específica."),
    conta_id: Optional[int] = Query(None, description="Filtra as despesas por uma conta específica."),
    forma_pagamento: Optional[str] = Query(None, description="Filtra as despesas por forma de pagamento.")
):
    if not ano:
        ano = datetime.now().year

    query = db.query(
        extract('month', Despesas.data_pagamento).label('mes'),
        func.sum(Despesas.valor_pago).label('valor') 
    )
    query = query.filter(extract('year', Despesas.data_pagamento) == ano)
    query = query.filter(Despesas.usuario_id == usuario_logado.id)
    if categoria:
        query = query.filter(Despesas.categoria == categoria)
    if conta_id:
        query = query.filter(Despesas.conta_id == conta_id)
    if forma_pagamento:
        query = query.filter(Despesas.forma_pagamento == forma_pagamento)

    despesas_agrupadas = query.group_by(extract('month', Despesas.data_pagamento)).all()

    despesas_por_mes_dict = {int(m): float(v) for m, v in despesas_agrupadas}
    resposta_final = []
    for i in range(1, 13):
        valor = despesas_por_mes_dict.get(i, 0.0)
        resposta_final.append(DespesaMensalResponse(mes=i, valor=valor))

    return resposta_final


@router.get(
    path=LISTA_DESPESAS, response_model=List[DespesaResponse], tags=[Tag.Despesas.name]
)
def get_despesas(usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    despesas = db.query(Despesas).filter(Despesas.usuario_id == usuario_logado.id).all()
    return [
        DespesaResponse(
            id=despesa.id,
            categoria=despesa.categoria,
            valor_pago=despesa.valor_pago,
            data_pagamento=despesa.data_pagamento,
            descricao=despesa.descricao,
            forma_pagamento=despesa.forma_pagamento,
            conta_id=despesa.conta_id,
            data_criacao=despesa.data_criacao,
            data_alteracao=despesa.data_alteracao,
        )
        for despesa in despesas
    ]


@router.get(
    path=CONSOLIDADO_DESPESAS, response_model=List[DespesaCategoriaResponse], tags=[Tag.Despesas.name]
)
def get_despesas_consolidadas(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: Optional[int] = None,
    mes: Optional[int] = None,
    conta_id: Optional[int] = None,
    forma_pagamento: Optional[str] = None
):
    query = db.query(
        Despesas.categoria.label('categoria'),
        func.sum(Despesas.valor_pago).label('valor')
    )
    query = query.filter(Despesas.usuario_id == usuario_logado.id)
    if ano:
        query = query.filter(extract("year", Despesas.data_pagamento) == ano)
    if mes:
        query = query.filter(extract("month", Despesas.data_pagamento) == mes)
    if conta_id:
        query = query.filter(Despesas.conta_id == conta_id)
    if forma_pagamento:
        query = query.filter(Despesas.forma_pagamento == forma_pagamento)

    despesas_agrupadas = query.group_by(Despesas.categoria).order_by(Despesas.categoria).all()
    resposta = [
        DespesaCategoriaResponse(categoria=categoria, valor=float(valor))
        for categoria, valor in despesas_agrupadas
    ]
    return resposta


@router.get(
    path=OBTER_POR_ID_DESPESAS, response_model=DespesaResponse, tags=[Tag.Despesas.name]
)
def get_despesa_by_id(despesas_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    despesa = db.query(Despesas).filter(Despesas.id == despesas_id, Despesas.usuario_id == usuario_logado.id).first()
    if not despesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Despesa não encontrada",
        )
    return DespesaResponse(
        id=despesa.id,
        categoria=despesa.categoria,
        valor_pago=despesa.valor_pago,
        data_pagamento=despesa.data_pagamento,
        descricao=despesa.descricao,
        forma_pagamento=despesa.forma_pagamento,
        conta_id=despesa.conta_id,
        data_criacao=despesa.data_criacao,
        data_alteracao=despesa.data_alteracao,
    )

@router.post(
    path=CADASTRO_DESPESAS, response_model=DespesaResponse, tags=[Tag.Despesas.name]
)
def create_despesa(despesa: DespesaCreate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == despesa.conta_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada ou não pertence ao usuário")

    db_despesa = Despesas(
        categoria=despesa.categoria,
        valor_pago=despesa.valor_pago,
        data_pagamento=despesa.data_pagamento,
        descricao=despesa.descricao,
        forma_pagamento=despesa.forma_pagamento,
        conta_id=despesa.conta_id,
        usuario_id=usuario_logado.id
    )

    db.add(db_despesa)

    # Atualiza saldo da conta subtraindo o valor pago (despesa diminui saldo)
    conta.saldo -= despesa.valor_pago

    db.commit()
    send_notification_background("despesa", db, despesa=db_despesa)
    db.refresh(db_despesa)

    # Envia notificação do Telegram
    try:
        telegram_service.notify_despesa_cadastrada(
            usuario_id=usuario_logado.id,
            categoria=despesa.categoria,
            valor=despesa.valor_pago,
            descricao=despesa.descricao or "Sem descrição",
            data_pagamento=despesa.data_pagamento.strftime("%d/%m/%Y"),
            conta_nome=conta.nome_conta
        )
    except Exception as e:
        # Log do erro mas não falha a operação
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro ao enviar notificação do Telegram para despesa: {e}")

    return DespesaResponse(
        id=db_despesa.id,
        categoria=db_despesa.categoria,
        valor_pago=db_despesa.valor_pago,
        data_pagamento=db_despesa.data_pagamento,
        descricao=db_despesa.descricao,
        forma_pagamento=db_despesa.forma_pagamento,
        conta_id=db_despesa.conta_id,
        data_criacao=db_despesa.data_criacao,
        data_alteracao=db_despesa.data_alteracao,
    )

@router.put(
    path=ATUALIZAR_DESPESAS, response_model=DespesaResponse, tags=[Tag.Despesas.name]
)
def update_despesa(despesas_id: int, despesa_update: DespesaUpdate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    despesa = db.query(Despesas).filter(Despesas.id == despesas_id, Despesas.usuario_id == usuario_logado.id).first()
    
    if not despesa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Despesa não encontrada")

    conta = db.query(Contas).filter(Contas.id == despesa.conta_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada ou não pertence ao usuário")

    # Ajusta o saldo: soma o valor antigo (pois vai ser removido) e depois subtrai o novo valor
    conta.saldo += despesa.valor_pago

    for field, value in despesa_update.__dict__.items():
        if value is not None:
            setattr(despesa, field, value)

    conta.saldo -= despesa.valor_pago

    db.commit()
    db.refresh(despesa)

    return DespesaResponse(
        id=despesa.id,
        categoria=despesa.categoria,
        valor_pago=despesa.valor_pago,
        data_pagamento=despesa.data_pagamento,
        descricao=despesa.descricao,
        forma_pagamento=despesa.forma_pagamento,
        conta_id=despesa.conta_id,
        data_criacao=despesa.data_criacao,
        data_alteracao=despesa.data_alteracao,
    )

@router.delete(
    path=APAGAR_DESPESAS, tags=[Tag.Despesas.name]
)
def delete_despesa(despesas_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    despesa = db.query(Despesas).filter(Despesas.id == despesas_id, Despesas.usuario_id == usuario_logado.id).first()
    if not despesa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Despesa não encontrada")

    conta = db.query(Contas).filter(Contas.id == despesa.conta_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada ou não pertence ao usuário")

    # Ao deletar despesa, soma o valor pago de volta no saldo da conta
    conta.saldo += despesa.valor_pago

    db.delete(despesa)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
