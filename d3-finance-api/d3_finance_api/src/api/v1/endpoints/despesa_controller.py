from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, Depends, Query, status, Response
from sqlalchemy import extract, func
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Despesas, Contas
from src.api.tags import Tag
from src.schemas.despesa_schemas import DespesaCategoriaResponse, DespesaCreate, DespesaUpdate, DespesaResponse, DespesaMensalResponse


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
    db: Session = Depends(get_db),
     ano: Optional[int] = Query(None, description="Filtra as despesas pelo ano. Se não for fornecido, usa o ano atual."),
    categoria: Optional[str] = Query(None, description="Filtra as despesas por uma categoria específica.")
):
    if not ano:
        ano = datetime.now().year

    query = db.query(
        extract('month', Despesas.data_pagamento).label('mes'),
        func.sum(Despesas.valor_pago).label('valor') 
    )
    query = query.filter(extract('year', Despesas.data_pagamento) == ano)

    if categoria:
        query = query.filter(Despesas.categoria == categoria)

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
def get_despesas(db: Session = Depends(get_db)):
    despesas = db.query(Despesas).all()
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
    db: Session = Depends(get_db),
    ano: Optional[int] = None,
    mes: Optional[int] = None
):
    query = db.query(
        Despesas.categoria.label('categoria'),
        func.sum(Despesas.valor_pago).label('valor')
    )
    if ano:
        query = query.filter(extract("year", Despesas.data_pagamento) == ano)
    if mes:
        query = query.filter(extract("month", Despesas.data_pagamento) == mes)

    despesas_agrupadas = query.group_by(Despesas.categoria).order_by(Despesas.categoria).all()
    resposta = [
        DespesaCategoriaResponse(categoria=categoria, valor=float(valor))
        for categoria, valor in despesas_agrupadas
    ]
    return resposta


@router.get(
    path=OBTER_POR_ID_DESPESAS, response_model=DespesaResponse, tags=[Tag.Despesas.name]
)
def get_despesa_by_id(despesas_id: int, db: Session = Depends(get_db)):
    despesa = db.query(Despesas).filter(Despesas.id == despesas_id).first()
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
def create_despesa(despesa: DespesaCreate, db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == despesa.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    db_despesa = Despesas(
        categoria=despesa.categoria,
        valor_pago=despesa.valor_pago,
        data_pagamento=despesa.data_pagamento,
        descricao=despesa.descricao,
        forma_pagamento=despesa.forma_pagamento,
        conta_id=despesa.conta_id,
    )

    db.add(db_despesa)

    # Atualiza saldo da conta subtraindo o valor pago (despesa diminui saldo)
    conta.saldo -= despesa.valor_pago

    db.commit()
    db.refresh(db_despesa)

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
def update_despesa(despesas_id: int, despesa_update: DespesaUpdate, db: Session = Depends(get_db)):
    despesa = db.query(Despesas).filter(Despesas.id == despesas_id).first()
    if not despesa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Despesa não encontrada")

    conta = db.query(Contas).filter(Contas.id == despesa.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

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
def delete_despesa(despesas_id: int, db: Session = Depends(get_db)):
    despesa = db.query(Despesas).filter(Despesas.id == despesas_id).first()
    if not despesa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Despesa não encontrada")

    conta = db.query(Contas).filter(Contas.id == despesa.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    # Ao deletar despesa, soma o valor pago de volta no saldo da conta
    conta.saldo += despesa.valor_pago

    db.delete(despesa)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
