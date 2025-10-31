"""
Ferramentas para consulta de despesas
"""
import json
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from ..database import execute_query


# ========== Schemas Pydantic para validação ==========

class ConsultaDespesasMesArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    mes: int = Field(..., description="Número do mês (1-12)")
    ano: int = Field(..., description="Ano completo (YYYY)")
    categoria: Optional[str] = Field(None, description="Categoria específica (opcional)")


class ConsultaDespesasAnoArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    ano: int = Field(..., description="Ano completo (YYYY)")
    categoria: Optional[str] = Field(None, description="Categoria específica (opcional)")


class ConsultaDespesasCategoriaArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    categoria: str = Field(..., description="Nome da categoria")
    mes: Optional[int] = Field(None, description="Mês específico (1-12, opcional)")
    ano: Optional[int] = Field(None, description="Ano específico (opcional)")


# ========== Ferramentas ==========

@tool(args_schema=ConsultaDespesasMesArgs)
def consultar_despesas_por_mes(usuario_id: int, mes: int, ano: int, categoria: Optional[str] = None) -> str:
    """
    Consulta o total de despesas de um usuário para um mês e ano específicos.
    Pode filtrar por categoria se especificado.
    
    Args:
        usuario_id: ID do usuário
        mes: Número do mês (1-12)
        ano: Ano completo (YYYY)
        categoria: Categoria específica (opcional)
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_despesas_por_mes ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, mes={mes}, ano={ano}, categoria={categoria} ---")
    
    try:
        # Query base
        query = """
            SELECT 
                COALESCE(SUM(valor_pago), 0) AS total_gasto,
                COUNT(*) AS quantidade
            FROM despesas
            WHERE usuario_id = %s
                AND MONTH(data_pagamento) = %s
                AND YEAR(data_pagamento) = %s
        """
        params = [usuario_id, mes, ano]
        
        # Adiciona filtro de categoria se fornecido
        if categoria:
            query += " AND categoria = %s"
            params.append(categoria)
        
        result = execute_query(query, tuple(params), fetch_one=True)
        
        total_gasto = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_gasto:.2f}, {quantidade} despesa(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "mes": mes,
            "ano": ano,
            "categoria": categoria,
            "total_gasto": total_gasto,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaDespesasAnoArgs)
def consultar_despesas_por_ano(usuario_id: int, ano: int, categoria: Optional[str] = None) -> str:
    """
    Consulta o total de despesas de um usuário para um ano completo.
    Pode filtrar por categoria se especificado.
    
    Args:
        usuario_id: ID do usuário
        ano: Ano completo (YYYY)
        categoria: Categoria específica (opcional)
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_despesas_por_ano ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, ano={ano}, categoria={categoria} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_pago), 0) AS total_gasto,
                COUNT(*) AS quantidade
            FROM despesas
            WHERE usuario_id = %s
                AND YEAR(data_pagamento) = %s
        """
        params = [usuario_id, ano]
        
        if categoria:
            query += " AND categoria = %s"
            params.append(categoria)
        
        result = execute_query(query, tuple(params), fetch_one=True)
        
        total_gasto = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_gasto:.2f}, {quantidade} despesa(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "ano": ano,
            "categoria": categoria,
            "total_gasto": total_gasto,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaDespesasCategoriaArgs)
def consultar_despesas_por_categoria(usuario_id: int, categoria: str, mes: Optional[int] = None, ano: Optional[int] = None) -> str:
    """
    Consulta despesas de um usuário filtradas por categoria.
    Pode filtrar por mês e/ou ano se especificado.
    
    Args:
        usuario_id: ID do usuário
        categoria: Nome da categoria
        mes: Mês específico (opcional, 1-12)
        ano: Ano específico (opcional)
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_despesas_por_categoria ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, categoria={categoria}, mes={mes}, ano={ano} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_pago), 0) AS total_gasto,
                COUNT(*) AS quantidade
            FROM despesas
            WHERE usuario_id = %s
                AND categoria = %s
        """
        params = [usuario_id, categoria]
        
        if mes:
            query += " AND MONTH(data_pagamento) = %s"
            params.append(mes)
        
        if ano:
            query += " AND YEAR(data_pagamento) = %s"
            params.append(ano)
        
        result = execute_query(query, tuple(params), fetch_one=True)
        
        total_gasto = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_gasto:.2f}, {quantidade} despesa(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "categoria": categoria,
            "mes": mes,
            "ano": ano,
            "total_gasto": total_gasto,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool
def consultar_total_despesas(usuario_id: int) -> str:
    """
    Consulta o total de todas as despesas de um usuário (todas as despesas já registradas).
    
    Args:
        usuario_id: ID do usuário
        
    Returns:
        JSON string com o total geral
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_total_despesas ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_pago), 0) AS total_gasto,
                COUNT(*) AS quantidade
            FROM despesas
            WHERE usuario_id = %s
        """
        
        result = execute_query(query, (usuario_id,), fetch_one=True)
        
        total_gasto = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_gasto:.2f}, {quantidade} despesa(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "total_gasto": total_gasto,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})

