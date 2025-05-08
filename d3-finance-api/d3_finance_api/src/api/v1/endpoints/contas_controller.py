from typing import List
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Contas
from src.schemas.contas_schemas import ContaCreate, ContaUpdate, ContaResponse
from src.api.tags import Tag
from sqlalchemy.exc import IntegrityError


# Endpoints
LISTA_CONTAS = "/v1/contas"
CADASTRO_CONTAS = "/v1/contas"
ATUALIZAR_CONTAS = "/v1/contas/{contas_id}"
APAGAR_CONTAS = "/v1/contas/{contas_id}"
OBTER_POR_ID_CONTAS = "/v1/contas/{contas_id}"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=LISTA_CONTAS, response_model=List[ContaResponse], tags=[Tag.Contas.name]
)
def get_contas(db: Session = Depends(get_db)):
    contas = db.query(Contas).all()
    return [ContaResponse(
        id=conta.id,
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
        data_criacao=conta.data_criacao,
        data_alteracao=conta.data_alteracao,
    ) for conta in contas]


@router.get(
    path=OBTER_POR_ID_CONTAS, response_model=ContaResponse, tags=[Tag.Contas.name]
)
def conta_by_id(contas_id: int, db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == contas_id).first()
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada",
        )
    return ContaResponse(
        id=conta.id,
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
        data_criacao=conta.data_criacao,
        data_alteracao=conta.data_alteracao,
    )


@router.post(
    path=CADASTRO_CONTAS, response_model=ContaResponse, tags=[Tag.Contas.name]
)
def create_contas(conta: ContaCreate, db: Session = Depends(get_db)):

    db_conta = Contas(
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
    )

    try:
        db.add(db_conta)
        db.commit()
        db.refresh(db_conta)

        return ContaResponse(
            id=db_conta.id,
            tipo_conta=conta.tipo_conta,
            nome_conta=conta.nome_conta,
        )
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig)

        if 'nome_conta' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma conta com esse nome.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar conta.",
        )

@router.put(
    path=ATUALIZAR_CONTAS, response_model=ContaResponse, tags=[Tag.Contas.name]
)
def update_conta(conta_id: int, conta_update: ContaUpdate, db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == conta_id).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada",
        )

    for key, value in conta_update.__dict__.items():
        if value is not None:
            setattr(conta, key, value)

    db.commit()
    db.refresh(conta)

    return ContaResponse(
        id=conta.id,
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
    )


@router.delete(
    path=APAGAR_CONTAS, tags=[Tag.Contas.name]
)
def delete_conta(contas_id: int, db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == contas_id).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada",
        )

    db.delete(conta)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)