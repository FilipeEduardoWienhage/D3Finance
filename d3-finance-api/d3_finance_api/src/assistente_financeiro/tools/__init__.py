"""
Ferramentas (Tools) para o assistente financeiro
"""
from .despesas_tools import (
    consultar_despesas_por_mes,
    consultar_despesas_por_ano,
    consultar_despesas_por_categoria,
    consultar_total_despesas
)
from .receitas_tools import (
    consultar_receitas_por_mes,
    consultar_receitas_por_ano,
    consultar_receitas_por_categoria,
    consultar_total_receitas
)
from .contas_tools import (
    consultar_saldo_contas,
    consultar_contas_usuario,
    consultar_movimentacoes_conta
)
from .contas_pagar_receber_tools import (
    consultar_contas_pagar,
    consultar_contas_receber,
    consultar_contas_vencidas
)
from .relatorios_tools import (
    consultar_balanco_mensal,
    consultar_balanco_anual,
    consultar_gastos_por_categoria
)

__all__ = [
    # Despesas
    "consultar_despesas_por_mes",
    "consultar_despesas_por_ano",
    "consultar_despesas_por_categoria",
    "consultar_total_despesas",
    # Receitas
    "consultar_receitas_por_mes",
    "consultar_receitas_por_ano",
    "consultar_receitas_por_categoria",
    "consultar_total_receitas",
    # Contas
    "consultar_saldo_contas",
    "consultar_contas_usuario",
    "consultar_movimentacoes_conta",
    # Contas a Pagar/Receber
    "consultar_contas_pagar",
    "consultar_contas_receber",
    "consultar_contas_vencidas",
    # Relatórios
    "consultar_balanco_mensal",
    "consultar_balanco_anual",
    "consultar_gastos_por_categoria",
]

