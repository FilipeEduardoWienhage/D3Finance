from datetime import date
from typing import Annotated, List, Optional
from fastapi import Depends, status, Response, Query, HTTPException
from sqlalchemy import extract, func, and_
from sqlalchemy.orm import Session
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.api.tags import Tag
from src.database.database import SessionLocal
from src.database.models import Receitas, Despesas, Contas
from src.app import router
from src.schemas.relatorios_schemas import (RelatorioMensalResponse, RelatorioAnualResponse)

#Endpoints
RELATORIO_MENSAL = "/v1/relatorios/mensal"
RELATORIO_ANUAL = "/v1/relatorios/anual"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get(path=RELATORIO_MENSAL, response_model=RelatorioMensalResponse, tags=[Tag.Relatorios.name])
def get_relatorio_mensal(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: int = Query(..., description="Ano do relatório"),
    mes: int = Query(..., description="Mês do relatório (1-12)")
):
    """Gera um relatório mensal consolidade"""
    
    if not 1 <= mes <= 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mês inválido. Deve estar entre 1 e 12.")

    # Calular o periódo
    data_inicio = date(ano, mes, 1)
    if mes == 12:
        data_fim = date(ano + 1, 1, 1) - date.resolution
    else:
        data_fim = date(ano, mes + 1, 1) - date.resolution

    # Buscar receitas do periodo
    receitas = db.query(
        func.sum(Receitas.valor_recebido).label("total"),
        func.count(Receitas.id).label("quantidade"),   
    ).filter(
        and_(
            Receitas.usuario_id == usuario_logado.id,
            Receitas.data_recebimento >= data_inicio,
            Receitas.data_recebimento <= data_fim
        )
    ).first()

    # Buscar despesas do período
    despesas = db.query(
        func.sum(Despesas.valor_pago).label('total'),
        func.count(Despesas.id).label('quantidade')
    ).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    ).first()

    # Receitas por categoria
    receitas_categoria = db.query(
        Receitas.categoria,
        func.sum(Receitas.valor_recebido).label('valor')
    ).filter(
        and_(
            Receitas.usuario_id == usuario_logado.id,
            Receitas.data_recebimento >= data_inicio,
            Receitas.data_recebimento <= data_fim
        )
    ).group_by(Receitas.categoria).all()

    # Despesas por categoria
    despesas_categoria = db.query(
        Despesas.categoria,
        func.sum(Despesas.valor_pago).label('valor')
    ).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    ).group_by(Despesas.categoria).all()

    # Receitas por conta
    receitas_conta = db.query(
        Contas.nome_conta,
        func.sum(Receitas.valor_recebido).label('valor')
    ).join(Contas, Receitas.conta_id == Contas.id).filter(
        and_(
            Receitas.usuario_id == usuario_logado.id,
            Contas.usuario_id == usuario_logado.id,
            Receitas.data_recebimento >= data_inicio,
            Receitas.data_recebimento <= data_fim
        )
    ).group_by(Contas.nome_conta).all()

    # Despesas por conta
    despesas_conta = db.query(
        Contas.nome_conta,
        func.sum(Despesas.valor_pago).label('valor')
    ).join(Contas, Despesas.conta_id == Contas.id).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Contas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    ).group_by(Contas.nome_conta).all()

    total_receitas = receitas.total or 0.0
    total_despesas = despesas.total or 0.0
    saldo_periodo = total_receitas - total_despesas

    # Preparar dados por conta
    receitas_por_conta_data = [
        {"conta": r.nome_conta, "valor": float(r.valor)}
        for r in receitas_conta
    ]
    despesas_por_conta_data = [
        {"conta": d.nome_conta, "valor": float(d.valor)}
        for d in despesas_conta
    ]
    
    
    return RelatorioMensalResponse(
        periodo_inicio=data_inicio,
        periodo_fim=data_fim,
        total_receitas=total_receitas,
        total_despesas=total_despesas,
        saldo_periodo=saldo_periodo,
        receitas_por_categoria=[
            {"categoria": r.categoria, "valor": float(r.valor)}
            for r in receitas_categoria
        ],
        despesas_por_categoria=[
            {"categoria": d.categoria, "valor": float(d.valor)}
            for d in despesas_categoria
        ],
        receitas_por_conta=receitas_por_conta_data,
        despesas_por_conta=despesas_por_conta_data,
        quantidade_receitas=receitas.quantidade or 0,
        quantidade_despesas=despesas.quantidade or 0
    )

@router.get(path=RELATORIO_ANUAL, response_model=RelatorioAnualResponse, tags=[Tag.Relatorios.name])
def get_relatorio_anual(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db),
    ano: int = Query(..., description="Ano do relatório")
):
    """Gera relatório anual consolidado"""
    data_inicio = date(ano, 1, 1)
    data_fim = date(ano, 12, 31)

    # totais anuais
    total_receitas = db.query(func.sum(Receitas.valor_recebido)).filter(
        and_(
            Receitas.usuario_id == usuario_logado.id,
            Receitas.data_recebimento >= data_inicio,
            Receitas.data_recebimento <= data_fim
        )
    ).scalar() or 0.0

    total_despesas = db.query(func.sum(Despesas.valor_pago)).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    ).scalar() or 0.0

    # Receitas por mês
    receitas_mensais = db.query(
        extract('month', Receitas.data_recebimento).label('mes'),
        func.sum(Receitas.valor_recebido).label('valor')
    ).filter(
        and_(
            Receitas.usuario_id == usuario_logado.id,
            Receitas.data_recebimento >= data_inicio,
            Receitas.data_recebimento <= data_fim
        )
    ).group_by(extract('month', Receitas.data_recebimento)).all()

    # Despesas por mês
    despesas_mensais = db.query(
        extract('month', Despesas.data_pagamento).label('mes'),
        func.sum(Despesas.valor_pago).label('valor')
    ).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    ).group_by(extract('month', Despesas.data_pagamento)).all()

    # Organizar dados por mês
    dados_mensais = []
    for mes in range(1, 13):
        receita_mes = next((r.valor for r in receitas_mensais if r.mes == mes), 0.0)
        despesa_mes = next((d.valor for d in despesas_mensais if d.mes == mes), 0.0)
        dados_mensais.append({
            "mes": mes,
            "receitas": float(receita_mes),
            "despesas": float(despesa_mes),
            "saldo_periodo": float(receita_mes - despesa_mes)
        })

    # Receitas por conta (anual) - consulta simples com INNER JOIN
    receitas_conta_anual = db.query(
        Contas.nome_conta,
        func.sum(Receitas.valor_recebido).label('valor')
    ).join(Contas, Receitas.conta_id == Contas.id).filter(
        and_(
            Receitas.usuario_id == usuario_logado.id,
            Contas.usuario_id == usuario_logado.id,
            Receitas.data_recebimento >= data_inicio,
            Receitas.data_recebimento <= data_fim
        )
    ).group_by(Contas.nome_conta).all()
    print(f"Receitas por conta (anual) encontradas: {len(receitas_conta_anual)}")
    for r in receitas_conta_anual:
        print(f"  - {r.nome_conta}: R$ {r.valor}")

    # Despesas por conta (anual) - consulta simples com INNER JOIN
    despesas_conta_anual = db.query(
        Contas.nome_conta,
        func.sum(Despesas.valor_pago).label('valor')
    ).join(Contas, Despesas.conta_id == Contas.id).filter(
        and_(
            Despesas.usuario_id == usuario_logado.id,
            Contas.usuario_id == usuario_logado.id,
            Despesas.data_pagamento >= data_inicio,
            Despesas.data_pagamento <= data_fim
        )
    ).group_by(Contas.nome_conta).all()
    print(f"Despesas por conta (anual) encontradas: {len(despesas_conta_anual)}")
    for d in despesas_conta_anual:
        print(f"  - {d.nome_conta}: R$ {d.valor}")

    return RelatorioAnualResponse(
        ano=ano,
        total_receitas=float(total_receitas),
        total_despesas=float(total_despesas),
        saldo_periodo=float(total_receitas - total_despesas),
        dados_mensais=dados_mensais,
        receitas_por_conta=[
            {"conta": r.nome_conta, "valor": float(r.valor)}
            for r in receitas_conta_anual
        ],
        despesas_por_conta=[
            {"conta": d.nome_conta, "valor": float(d.valor)}
            for d in despesas_conta_anual
        ]
    )


