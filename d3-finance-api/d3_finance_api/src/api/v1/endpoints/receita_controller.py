from datetime import date, datetime
from typing import Annotated, List, Optional
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy import extract, func
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Receitas, Contas
from src.api.tags import Tag
from src.schemas.receita_schemas import ReceitaConsolidadoResponse, ReceitaCreate, ReceitaUpdate, ReceitaResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData

LISTA_RECEITAS = "/v1/receitas"
CONSOLIDADO_RECEITAS = "/v1/receitas/consolidado"
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
def get_receitas(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)):
    # receitas = db.query(Receitas).filter(Receitas.id_usuario == usuario_logado.id).all()
    receitas = db.query(Receitas).all()
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
    path=CONSOLIDADO_RECEITAS, response_model=List[ReceitaConsolidadoResponse], tags=[Tag.Receitas.name]
)
def get_receitas_consolidadas( 
    db: Session = Depends(get_db),
    ano: Optional[int] = None,
    mes: Optional[int] = None,
    categoria: Optional[str] = None
    ):
    if not ano:
        ano = datetime.now().year

    query = db.query(
        extract('month', Receitas.data_recebimento).label('mes'),
        func.sum(Receitas.valor_recebido).label('valor_total')
    )

    query = query.filter(extract('year', Receitas.data_recebimento) == ano)

    if mes:
        query = query.filter(extract('month', Receitas.data_recebimento) == mes)

    if categoria:
        query = query.filter(Receitas.categoria == categoria)

    receitas_agrupadas = query.group_by("mes").order_by("mes").all()

    receitas_por_mes = {int(m): float(v) for m, v in receitas_agrupadas}

    if mes:
        meses_a_exibir = [mes]
    else:
        meses_a_exibir = range(1, 13)


    resposta = [
        ReceitaConsolidadoResponse(mes=m, valor=receitas_por_mes.get(mes, 0.0))
        for m in meses_a_exibir
    ]

    if not mes:
        resposta_completa = []
        for i in range(1, 13):
            valor = receitas_por_mes.get(i, 0.0)
            resposta_completa.append(ReceitaConsolidadoResponse(mes=i, valor=valor))
        return resposta_completa
    return resposta



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
def create_receita(receita: ReceitaCreate, db: Session = Depends(get_db)):  
    # Verifica se conta existe
    conta = db.query(Contas).filter(Contas.id == receita.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    
    db_receita = Receitas(
        categoria=receita.categoria,
        valor_recebido=receita.valor_recebido,
        data_recebimento=receita.data_recebimento,
        forma_recebimento=receita.forma_recebimento,
        descricao=receita.descricao,
        conta_id=receita.conta_id,
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
def update_receita(receitas_id: int, receita_update: ReceitaUpdate, db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receitas_id).first()
    
    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    conta = db.query(Contas).filter(Contas.id == receita.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    # Ajusta o saldo da conta:
    # Subtrai o valor antigo da receita do saldo da conta
    conta.saldo -= receita.valor_recebido

    # Atualiza os campos da receita
    for field, value in receita_update.__dict__.items():
        if value is not None:
            setattr(receita, field, value)

    # Soma o novo valor da receita no saldo da conta
    conta.saldo += receita.valor_recebido

    db.commit()
    db.refresh(receita)

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


@router.delete(
    path=APAGAR_RECEITAS, tags=[Tag.Receitas.name]
)
def delete_receita(receitas_id: int, db: Session = Depends(get_db)):
    receita = db.query(Receitas).filter(Receitas.id == receitas_id).first()

    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    conta = db.query(Contas).filter(Contas.id == receita.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    # Subtrai o valor da receita do saldo da conta
    conta.saldo -= receita.valor_recebido

    db.delete(receita)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
