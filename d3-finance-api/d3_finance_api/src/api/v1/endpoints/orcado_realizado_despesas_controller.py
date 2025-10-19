from datetime import date
from typing import Annotated
from fastapi import Depends, Query
from sqlalchemy import extract, func, and_
from sqlalchemy.orm import Session
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.api.tags import Tag
from src.database.database import SessionLocal
from src.database.models import ContasPagar, Despesas
from src.app import router
from src.schemas.orcado_realizado_schemas import OrcadoRealizadoResponse

# Endpoint
ORCADO_REALIZADO_DESPESAS = "/v1/orcado-realizado-despesas"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(path=ORCADO_REALIZADO_DESPESAS, response_model=OrcadoRealizadoResponse, tags=[Tag.Relatorios.name])
def get_orcado_realizado_despesas(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: int = Query(..., description="Ano do relatório"),
    mes: int = Query(None, ge=1, le=12, description="Mês específico (1-12). Se não informado, considera o ano inteiro"),
    categoria: str = Query(None, description="Filtrar por categoria de despesa")
):
    """
    Gera relatório de orçado x realizado para despesas
    
    - Orçado: Todas as contas a pagar cadastradas (independente do status)
    - Realizado: Contas a pagar pagas + Despesas cadastradas manualmente
    - Permite filtrar por mês específico e/ou categoria
    """
    # Definir período baseado se tem filtro de mês ou não
    if mes:
        data_inicio = date(ano, mes, 1)
        if mes == 12:
            data_fim = date(ano + 1, 1, 1) - date.resolution
        else:
            data_fim = date(ano, mes + 1, 1) - date.resolution
        # Se filtrou por mês, mostrar só esse mês nos dados
        meses_para_processar = [mes]
    else:
        data_inicio = date(ano, 1, 1)
        data_fim = date(ano, 12, 31)
        meses_para_processar = range(1, 13)

    # Buscar valores orçados (todas as contas a pagar) por mês
    query_orcados = db.query(
        extract('month', ContasPagar.data_vencimento).label('mes'),
        func.sum(ContasPagar.valor).label('valor')
    ).filter(
        and_(
            ContasPagar.usuario_id == usuario_logado.id,
            ContasPagar.data_vencimento >= data_inicio,
            ContasPagar.data_vencimento <= data_fim
        )
    )
    
    # Aplicar filtro de categoria se fornecido
    if categoria:
        query_orcados = query_orcados.filter(ContasPagar.categoria_despesa == categoria)
    
    orcados_mensais = query_orcados.group_by(extract('month', ContasPagar.data_vencimento)).all()

    # Buscar valores realizados de contas a pagar pagas por mês
    query_contas_pagas = db.query(
        extract('month', ContasPagar.data_vencimento).label('mes'),
        func.sum(ContasPagar.valor).label('valor')
    ).filter(
        and_(
            ContasPagar.usuario_id == usuario_logado.id,
            ContasPagar.data_vencimento >= data_inicio,
            ContasPagar.data_vencimento <= data_fim,
            ContasPagar.status == 'Pago'
        )
    )
    
    # Aplicar filtro de categoria se fornecido
    if categoria:
        query_contas_pagas = query_contas_pagas.filter(ContasPagar.categoria_despesa == categoria)
    
    contas_pagar_pagas = query_contas_pagas.group_by(extract('month', ContasPagar.data_vencimento)).all()

    # Buscar despesas cadastradas manualmente por mês
    query_despesas = db.query(
        extract('month', Despesas.data_pagamento).label('mes'),
        func.sum(Despesas.valor_pago).label('valor')
    ).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    )
    
    # Aplicar filtro de categoria se fornecido
    if categoria:
        query_despesas = query_despesas.filter(Despesas.categoria == categoria)
    
    despesas_manuais = query_despesas.group_by(extract('month', Despesas.data_pagamento)).all()

    # Organizar dados por mês
    dados_mensais = []
    total_orcado = 0.0
    total_realizado = 0.0

    for mes_num in meses_para_processar:
        orcado_mes = next((float(o.valor) for o in orcados_mensais if o.mes == mes_num), 0.0)
        
        # Realizado = contas a pagar pagas + despesas cadastradas manualmente
        contas_pagas_mes = next((float(r.valor) for r in contas_pagar_pagas if r.mes == mes_num), 0.0)
        despesas_manuais_mes = next((float(r.valor) for r in despesas_manuais if r.mes == mes_num), 0.0)
        realizado_mes = contas_pagas_mes + despesas_manuais_mes
        
        diferenca = realizado_mes - orcado_mes
        
        total_orcado += orcado_mes
        total_realizado += realizado_mes
        
        dados_mensais.append({
            "mes": mes_num,
            "orcado": orcado_mes,
            "realizado": realizado_mes,
            "diferenca": diferenca
        })

    return OrcadoRealizadoResponse(
        ano=ano,
        total_orcado=total_orcado,
        total_realizado=total_realizado,
        total_diferenca=total_realizado - total_orcado,
        dados_mensais=dados_mensais
    )

