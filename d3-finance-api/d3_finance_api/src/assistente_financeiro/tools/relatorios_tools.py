"""
Ferramentas para relatórios e análises financeiras
"""
import json
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from ..database import execute_query


# ========== Schemas Pydantic ==========

class ConsultaBalancoMensalArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    mes: int = Field(..., description="Número do mês (1-12)")
    ano: int = Field(..., description="Ano completo (YYYY)")


class ConsultaBalancoAnualArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    ano: int = Field(..., description="Ano completo (YYYY)")


class ConsultaGastosCategoriaArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    mes: Optional[int] = Field(None, description="Mês específico (1-12, opcional)")
    ano: Optional[int] = Field(None, description="Ano específico (opcional)")


# ========== Ferramentas ==========

@tool(args_schema=ConsultaBalancoMensalArgs)
def consultar_balanco_mensal(usuario_id: int, mes: int, ano: int) -> str:
    """
    Consulta o balanço financeiro mensal (receitas - despesas) de um usuário.
    
    Args:
        usuario_id: ID do usuário
        mes: Número do mês (1-12)
        ano: Ano completo (YYYY)
        
    Returns:
        JSON string com o balanço mensal
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_balanco_mensal ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, mes={mes}, ano={ano} ---")
    
    try:
        # Total de receitas do mês
        query_receitas = """
            SELECT COALESCE(SUM(valor_recebido), 0) AS total
            FROM receitas
            WHERE usuario_id = %s
                AND MONTH(data_recebimento) = %s
                AND YEAR(data_recebimento) = %s
        """
        result_receitas = execute_query(query_receitas, (usuario_id, mes, ano), fetch_one=True)
        total_receitas = float(result_receitas[0]) if result_receitas and result_receitas[0] else 0.0
        
        # Total de despesas do mês
        query_despesas = """
            SELECT COALESCE(SUM(valor_pago), 0) AS total
            FROM despesas
            WHERE usuario_id = %s
                AND MONTH(data_pagamento) = %s
                AND YEAR(data_pagamento) = %s
        """
        result_despesas = execute_query(query_despesas, (usuario_id, mes, ano), fetch_one=True)
        total_despesas = float(result_despesas[0]) if result_despesas and result_despesas[0] else 0.0
        
        # Saldo do mês
        saldo_mensal = total_receitas - total_despesas
        
        print(f"--- ✔️ Resultado: Receitas R$ {total_receitas:.2f}, Despesas R$ {total_despesas:.2f}, Saldo R$ {saldo_mensal:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "mes": mes,
            "ano": ano,
            "total_receitas": total_receitas,
            "total_despesas": total_despesas,
            "saldo_mensal": saldo_mensal
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaBalancoAnualArgs)
def consultar_balanco_anual(usuario_id: int, ano: int) -> str:
    """
    Consulta o balanço financeiro anual (receitas - despesas) de um usuário.
    
    Args:
        usuario_id: ID do usuário
        ano: Ano completo (YYYY)
        
    Returns:
        JSON string com o balanço anual
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_balanco_anual ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, ano={ano} ---")
    
    try:
        # Total de receitas do ano
        query_receitas = """
            SELECT COALESCE(SUM(valor_recebido), 0) AS total
            FROM receitas
            WHERE usuario_id = %s
                AND YEAR(data_recebimento) = %s
        """
        result_receitas = execute_query(query_receitas, (usuario_id, ano), fetch_one=True)
        total_receitas = float(result_receitas[0]) if result_receitas and result_receitas[0] else 0.0
        
        # Total de despesas do ano
        query_despesas = """
            SELECT COALESCE(SUM(valor_pago), 0) AS total
            FROM despesas
            WHERE usuario_id = %s
                AND YEAR(data_pagamento) = %s
        """
        result_despesas = execute_query(query_despesas, (usuario_id, ano), fetch_one=True)
        total_despesas = float(result_despesas[0]) if result_despesas and result_despesas[0] else 0.0
        
        # Saldo do ano
        saldo_anual = total_receitas - total_despesas
        
        print(f"--- ✔️ Resultado: Receitas R$ {total_receitas:.2f}, Despesas R$ {total_despesas:.2f}, Saldo R$ {saldo_anual:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "ano": ano,
            "total_receitas": total_receitas,
            "total_despesas": total_despesas,
            "saldo_anual": saldo_anual
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaGastosCategoriaArgs)
def consultar_gastos_por_categoria(usuario_id: int, mes: Optional[int] = None, ano: Optional[int] = None) -> str:
    """
    Consulta gastos agrupados por categoria de despesa.
    Pode filtrar por mês e/ou ano.
    
    Args:
        usuario_id: ID do usuário
        mes: Mês específico (opcional, 1-12)
        ano: Ano específico (opcional)
        
    Returns:
        JSON string com gastos por categoria
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_gastos_por_categoria ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, mes={mes}, ano={ano} ---")
    
    try:
        query = """
            SELECT 
                categoria,
                COALESCE(SUM(valor_pago), 0) AS total,
                COUNT(*) AS quantidade
            FROM despesas
            WHERE usuario_id = %s
        """
        params = [usuario_id]
        
        if mes:
            query += " AND MONTH(data_pagamento) = %s"
            params.append(mes)
        
        if ano:
            query += " AND YEAR(data_pagamento) = %s"
            params.append(ano)
        
        query += " GROUP BY categoria ORDER BY total DESC"
        
        results = execute_query(query, tuple(params))
        
        categorias = []
        total_geral = 0.0
        
        for row in results:
            categoria = {
                "categoria": row[0],
                "total": float(row[1]),
                "quantidade": int(row[2])
            }
            categorias.append(categoria)
            total_geral += float(row[1])
        
        print(f"--- ✔️ Resultado: {len(categorias)} categoria(s), Total: R$ {total_geral:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "mes": mes,
            "ano": ano,
            "categorias": categorias,
            "total_geral": total_geral
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})

