from typing import List
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Receitas
from src.api.tags import Tag
from src.schemas.receita_schemas import ReceitaCreate, ReceitaUpdate, ReceitaResponse


LISTA_RECEITAS = "/v1/receitas"
CADASTRO_RECEITAS = "/v1/receitas"
ATUALIZAR_RECEITAS = "/v1/receitas/{receitas_id}"
APAGAR_RECEITAS = "/v1/receitas/{receitas_id}"
OBTER_POR_ID_RECEITAS = "/v1/receitas/{receitas_id}"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=LISTA_RECEITAS, response_model=List[ReceitaResponse], tags=[Tag.Receitas.name]
)
def get_receitas(db: Session = Depends(get_db)):
    receitas = db.query(Receitas).all()
    return [ReceitaResponse(
        id=receita.id,
        categoria=receita.categoria,
        nome_receita=receita.nome_receita,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        descricao=receita.descricao,
        forma_recebimento=receita.forma_recebimento,
    ) for receita in receitas]


@router.get(
    path=OBTER_POR_ID_RECEITAS, response_model=ReceitaResponse, tags=[Tag.Receitas.name]
)
def get_receita_by_id(receitas_id: int, db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receitas_id).first()
    if not receita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receita não encontrada",
        )
    return ReceitaResponse(
        id=receita.id,
        categoria=receita.categoria,
        nome_receita=receita.nome_receita,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        descricao=receita.descricao,
        forma_recebimento=receita.forma_recebimento,
    )


@router.post(
    path=CADASTRO_RECEITAS, response_model=ReceitaResponse, tags=[Tag.Receitas.name]
)
def create_receita(receita: ReceitaCreate, db: Session = Depends(get_db)):  

    # Cria a nova receita
    db_receita = Receitas(
        categoria=receita.categoria,
        nome_receita=receita.nome_receita,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        forma_recebimento=receita.forma_recebimento,
        descricao=receita.descricao
    )

    db.add(db_receita)  
    db.commit()  
    db.refresh(db_receita)  

    return ReceitaResponse(
        id=db_receita.id,
        categoria=db_receita.categoria,
        nome_receita=db_receita.nome_receita,
        valor_recebido=db_receita.valor_recebido,
        data_recebimento=db_receita.data_recebimento,
        descricao=db_receita.descricao,
        forma_recebimento=db_receita.forma_recebimento,
    )

# PUT - Atualizar receita
@router.put(
    path=ATUALIZAR_RECEITAS, response_model=ReceitaResponse, tags=[Tag.Receitas.name]
)
def update_receita(receitas_id: int, receita_update: ReceitaUpdate, db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receitas_id).first()
    
    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    # Atualiza os campos da receita
    for field, value in receita_update.__dict__.items():
        if value is not None:
            setattr(receita, field, value)

    db.commit()
    db.refresh(receita)

    return ReceitaResponse(
        id=receita.id,
        categoria=receita.categoria,
        nome_receita=receita.nome_receita,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        descricao=receita.descricao,
        forma_recebimento=receita.forma_recebimento,
    )


@router.delete(
    path=APAGAR_RECEITAS, tags=[Tag.Receitas.name]
)
def delete_receita(receitas_id: int, db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receitas_id).first()

    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    
    db.delete(receita)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)
