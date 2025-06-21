from datetime import date, datetime
from typing import Annotated, List, Optional
from fastapi import HTTPException, Depends, status, Response, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Receitas, Contas, Usuario
from src.api.tags import Tag
from src.schemas.receita_schemas import ReceitaCategoriaResponse, ReceitaCreate, ReceitaUpdate, ReceitaResponse, ReceitaMensalResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData

CONSOLIDADO_MENSAL_RECEITAS = "/v1/receitas/consolidado/mensal"
LISTA_RECEITAS = "/v1/receitas"
CONSOLIDADO_RECEITAS = "/v1/receitas/consolidado"
OBTER_POR_ID_RECEITAS = "/v1/receitas/{receita_id}"
CADASTRO_RECEITAS = "/v1/receitas"
ATUALIZAR_RECEITAS = "/v1/receitas/{receita_id}"
APAGAR_RECEITAS = "/v1/receitas/{receita_id}"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=CONSOLIDADO_MENSAL_RECEITAS,
    response_model=List[ReceitaMensalResponse],
    tags=[Tag.Receitas.name]
)
def get_receitas_consolidadas_mensal(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: Optional[int] = Query(None, description="Filtra as receitas pelo ano. Se não for fornecido, usa o ano atual."),
    categoria: Optional[str] = Query(None, description="Filtra as receitas por uma categoria específica."),
    conta_id: Optional[int] = Query(None, description="Filtra as receitas por uma conta específica."),
    forma_recebimento: Optional[str] = Query(None, description="Filtra as receitas por forma de recebimento.")
):
    if not ano:
        ano = datetime.now().year

    query = db.query(
        extract('month', Receitas.data_recebimento).label('mes'),
        func.sum(Receitas.valor_recebido).label('valor')
    ).filter(Receitas.usuario_id == usuario_logado.id)

    query = query.filter(extract('year', Receitas.data_recebimento) == ano)

    if categoria:
        query = query.filter(Receitas.categoria == categoria)
    if conta_id:
        query = query.filter(Receitas.conta_id == conta_id)
    if forma_recebimento:
        query = query.filter(Receitas.forma_recebimento == forma_recebimento)

    receitas_agrupadas = query.group_by(extract('month', Receitas.data_recebimento)).all()

    receitas_por_mes_dict = {int(m): float(v) for m, v in receitas_agrupadas}
    resposta_final = []
    for i in range(1, 13):
        valor = receitas_por_mes_dict.get(i, 0.0)
        resposta_final.append(ReceitaMensalResponse(mes=i, valor=valor))

    return resposta_final


@router.get(
    path=LISTA_RECEITAS, response_model=List[ReceitaResponse], tags=[Tag.Receitas.name]
)
def get_receitas(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)):
    receitas = db.query(Receitas).filter(Receitas.usuario_id == usuario_logado.id).all()
    return [ReceitaResponse(
        id=receita.id,
        categoria=receita.categoria,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        descricao=receita.descricao,
        forma_recebimento=receita.forma_recebimento,
        conta_id=receita.conta_id,
        data_criacao=receita.data_criacao,
        data_alteracao=receita.data_alteracao,
    ) for receita in receitas]


@router.get(
    path=CONSOLIDADO_RECEITAS, response_model=List[ReceitaCategoriaResponse], tags=[Tag.Receitas.name]
)
def get_receitas_por_categoria(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: Optional[int] = None,
    mes: Optional[int] = None,
    conta_id: Optional[int] = None,
    forma_recebimento: Optional[str] = None
):
    query = db.query(
        Receitas.categoria.label('categoria'),
        func.sum(Receitas.valor_recebido).label('valor')
    ).filter(Receitas.usuario_id == usuario_logado.id)
    if ano:
        query = query.filter(extract("year", Receitas.data_recebimento) == ano)
    if mes:
        query = query.filter(extract("month", Receitas.data_recebimento) == mes)
    if conta_id:
        query = query.filter(Receitas.conta_id == conta_id)
    if forma_recebimento:
        query = query.filter(Receitas.forma_recebimento == forma_recebimento)

    receitas_agrupadas = query.group_by(Receitas.categoria).order_by(Receitas.categoria).all()
    return [
        ReceitaCategoriaResponse(categoria=cat, valor=float(val))
        for cat, val in receitas_agrupadas
    ]


@router.get(
    path=OBTER_POR_ID_RECEITAS, response_model=ReceitaResponse, tags=[Tag.Receitas.name]
)
def get_receita_by_id(receita_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receita_id, Receitas.usuario_id == usuario_logado.id).first()
    if not receita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receita não encontrada ou não pertence ao usuário",
        )
    return ReceitaResponse(
        id=receita.id,
        categoria=receita.categoria,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        descricao=receita.descricao,
        forma_recebimento=receita.forma_recebimento,
        conta_id=receita.conta_id,
        data_criacao=receita.data_criacao,
        data_alteracao=receita.data_alteracao,
    )


@router.post(
    path=CADASTRO_RECEITAS, response_model=ReceitaResponse, tags=[Tag.Receitas.name]
)
def create_receita(receita: ReceitaCreate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    conta = db.query(Contas).filter(Contas.id == receita.conta_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada ou não pertence ao usuário")

    db_receita = Receitas(
        categoria=receita.categoria,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        forma_recebimento=receita.forma_recebimento,
        descricao=receita.descricao,
        conta_id=receita.conta_id,
        usuario_id=usuario_logado.id
    )

    db.add(db_receita)

    # Atualiza saldo da conta
    conta.saldo += receita.valor_recebido

    db.commit()
    db.refresh(db_receita)

    return ReceitaResponse(
        id=db_receita.id,
        categoria=db_receita.categoria,
        valor_recebido=db_receita.valor_recebido,
        data_recebimento=db_receita.data_recebimento,
        descricao=db_receita.descricao,
        forma_recebimento=db_receita.forma_recebimento,
        conta_id=db_receita.conta_id,
        data_criacao=db_receita.data_criacao,
        data_alteracao=db_receita.data_alteracao,
    )


@router.put(
    path=ATUALIZAR_RECEITAS, response_model=ReceitaResponse, tags=[Tag.Receitas.name]
)
def update_receita(receita_id: int, receita_update: ReceitaUpdate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receita_id, Receitas.usuario_id == usuario_logado.id).first()

    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada ou não pertence ao usuário")

    conta = db.query(Contas).filter(Contas.id == receita.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta associada à receita não encontrada")

    # Ajusta o saldo da conta:
    # Subtrai o valor antigo da receita do saldo da conta
    conta.saldo -= receita.valor_recebido

    # Atualiza os campos da receita
    for field, value in receita_update.model_dump(exclude_unset=True).items():
        setattr(receita, field, value)

    # Soma o novo valor da receita no saldo da conta
    conta.saldo += receita.valor_recebido

    db.commit()
    db.refresh(receita)

    return ReceitaResponse.model_validate(receita)


@router.delete(
    path=APAGAR_RECEITAS, tags=[Tag.Receitas.name]
)
def delete_receita(receita_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receita_id, Receitas.usuario_id == usuario_logado.id).first()

    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada ou não pertence ao usuário")

    conta = db.query(Contas).filter(Contas.id == receita.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta associada à receita não encontrada")

    # Subtrai o valor da receita do saldo da conta
    conta.saldo -= receita.valor_recebido

    db.delete(receita)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
