from typing import List, Annotated, Optional
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Contas
from src.schemas.contas_schemas import ContaCreate, ContaUpdate, ContaResponse
from src.api.tags import Tag
from sqlalchemy.exc import IntegrityError
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData

# Endpoints
LISTA_CONTAS = "/v1/contas"
CADASTRO_CONTAS = "/v1/contas"
ATUALIZAR_CONTAS = "/v1/contas/{conta_id}"
APAGAR_CONTAS = "/v1/contas/{conta_id}"
OBTER_POR_ID_CONTAS = "/v1/contas/{conta_id}"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=LISTA_CONTAS, response_model=List[ContaResponse], tags=[Tag.Contas.name]
)
def get_contas(usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    contas = db.query(Contas).filter(Contas.usuario_id == usuario_logado.id).all()
    return [ContaResponse(
        id=conta.id,
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
        saldo=conta.saldo,
        data_criacao=conta.data_criacao,
        data_alteracao=conta.data_alteracao,
    ) for conta in contas]


@router.get(
    path=OBTER_POR_ID_CONTAS, response_model=ContaResponse, tags=[Tag.Contas.name]
)
def conta_by_id(conta_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == conta_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada ou não pertence ao usuário",
        )
    return ContaResponse(
        id=conta.id,
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
        saldo=conta.saldo,
        data_criacao=conta.data_criacao,
        data_alteracao=conta.data_alteracao,
    )


@router.post(
    path=CADASTRO_CONTAS, response_model=ContaResponse, tags=[Tag.Contas.name]
)
def create_contas(conta: ContaCreate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):

    db_conta = Contas(
        tipo_conta=conta.tipo_conta,
        nome_conta=conta.nome_conta,
        saldo=conta.saldo if conta.saldo is not None else 0.0,
        usuario_id=usuario_logado.id
    )

    try:
        db.add(db_conta)
        db.commit()
        db.refresh(db_conta)

        return ContaResponse(
            id=db_conta.id,
            tipo_conta=conta.tipo_conta,
            nome_conta=conta.nome_conta,
            saldo=db_conta.saldo,
            data_criacao=db_conta.data_criacao,
            data_alteracao=db_conta.data_alteracao,
        )
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig)

        if 'nome_conta' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma conta com esse nome para este usuário.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar conta.",
        )


@router.put(
    path=ATUALIZAR_CONTAS, response_model=ContaResponse, tags=[Tag.Contas.name]
)
def update_conta(conta_id: int, conta_update: ContaUpdate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == conta_id, Contas.usuario_id == usuario_logado.id).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada ou não pertence ao usuário",
        )

    for field, value in conta_update.model_dump(exclude_unset=True).items():
        setattr(conta, field, value)

    db.commit()
    db.refresh(conta)

    return ContaResponse.model_validate(conta)


@router.delete(
    path=APAGAR_CONTAS, tags=[Tag.Contas.name]
)
def delete_conta(conta_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == conta_id, Contas.usuario_id == usuario_logado.id).first()

    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada ou não pertence ao usuário",
        )

    db.delete(conta)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
