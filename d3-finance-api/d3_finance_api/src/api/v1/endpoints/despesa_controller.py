from typing import List
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Despesas
from src.api.tags import Tag
from src.schemas.despesa_schemas import DespesaCreate, DespesaUpdate, DespesaResponse

LISTA_DESPESAS = "/v1/despesas"
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
    path=LISTA_DESPESAS, response_model=List[DespesaResponse], tags=[Tag.Despesas.name]
)
def get_despesas(db: Session = Depends(get_db)):
    despesas = db.query(Despesas).all()
    return [
        DespesaResponse(
            id=despesa.id,
            categoria=despesa.categoria,
            nome_despesa=despesa.nome_despesa,
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
        nome_despesa=despesa.nome_despesa,
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
    db_despesa = Despesas(
        categoria=despesa.categoria,
        nome_despesa=despesa.nome_despesa,
        valor_pago=despesa.valor_pago,
        data_pagamento=despesa.data_pagamento,
        descricao=despesa.descricao,
        forma_pagamento=despesa.forma_pagamento,
        conta_id=despesa.conta_id,
    )

    db.add(db_despesa)
    db.commit()
    db.refresh(db_despesa)

    return DespesaResponse(
        id=db_despesa.id,
        categoria=db_despesa.categoria,
        nome_despesa=db_despesa.nome_despesa,
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
    
    for field, value in despesa_update.__dict__.items():
        if value is not None:
            setattr(despesa, field, value)

    db.commit()
    db.refresh(despesa)

    return DespesaResponse(
        id=despesa.id,
        categoria=despesa.categoria,
        nome_despesa=despesa.nome_despesa,
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

    db.delete(despesa)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
