"""
Ferramentas para consulta de receitas
"""
import json
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from ..database import execute_query


# ========== Schemas Pydantic ==========

class ConsultaReceitasMesArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    mes: int = Field(..., description="Número do mês (1-12)")
    ano: int = Field(..., description="Ano completo (YYYY)")
    categoria: Optional[str] = Field(None, description="Categoria específica (opcional)")


class ConsultaReceitasAnoArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    ano: int = Field(..., description="Ano completo (YYYY)")
    categoria: Optional[str] = Field(None, description="Categoria específica (opcional)")


class ConsultaReceitasCategoriaArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    categoria: str = Field(..., description="Nome da categoria")
    mes: Optional[int] = Field(None, description="Mês específico (1-12, opcional)")
    ano: Optional[int] = Field(None, description="Ano específico (opcional)")


# ========== Ferramentas ==========

@tool(args_schema=ConsultaReceitasMesArgs)
def consultar_receitas_por_mes(usuario_id: int, mes: int, ano: int, categoria: Optional[str] = None) -> str:
    """
    Consulta o total de receitas de um usuário para um mês e ano específicos.
    Pode filtrar por categoria se especificado.
    
    Args:
        usuario_id: ID do usuário
        mes: Número do mês (1-12)
        ano: Ano completo (YYYY)
        categoria: Categoria específica (opcional)
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_receitas_por_mes ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, mes={mes}, ano={ano}, categoria={categoria} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_recebido), 0) AS total_receita,
                COUNT(*) AS quantidade
            FROM receitas
            WHERE usuario_id = %s
                AND MONTH(data_recebimento) = %s
                AND YEAR(data_recebimento) = %s
        """
        params = [usuario_id, mes, ano]
        
        if categoria:
            query += " AND categoria = %s"
            params.append(categoria)
        
        result = execute_query(query, tuple(params), fetch_one=True)
        
        total_receita = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_receita:.2f}, {quantidade} receita(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "mes": mes,
            "ano": ano,
            "categoria": categoria,
            "total_receita": total_receita,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaReceitasAnoArgs)
def consultar_receitas_por_ano(usuario_id: int, ano: int, categoria: Optional[str] = None) -> str:
    """
    Consulta o total de receitas de um usuário para um ano completo.
    Pode filtrar por categoria se especificado.
    
    Args:
        usuario_id: ID do usuário
        ano: Ano completo (YYYY)
        categoria: Categoria específica (opcional)
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_receitas_por_ano ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, ano={ano}, categoria={categoria} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_recebido), 0) AS total_receita,
                COUNT(*) AS quantidade
            FROM receitas
            WHERE usuario_id = %s
                AND YEAR(data_recebimento) = %s
        """
        params = [usuario_id, ano]
        
        if categoria:
            query += " AND categoria = %s"
            params.append(categoria)
        
        result = execute_query(query, tuple(params), fetch_one=True)
        
        total_receita = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_receita:.2f}, {quantidade} receita(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "ano": ano,
            "categoria": categoria,
            "total_receita": total_receita,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaReceitasCategoriaArgs)
def consultar_receitas_por_categoria(usuario_id: int, categoria: str, mes: Optional[int] = None, ano: Optional[int] = None) -> str:
    """
    Consulta receitas de um usuário filtradas por categoria.
    Pode filtrar por mês e/ou ano se especificado.
    
    Args:
        usuario_id: ID do usuário
        categoria: Nome da categoria
        mes: Mês específico (opcional, 1-12)
        ano: Ano específico (opcional)
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_receitas_por_categoria ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, categoria={categoria}, mes={mes}, ano={ano} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_recebido), 0) AS total_receita,
                COUNT(*) AS quantidade
            FROM receitas
            WHERE usuario_id = %s
                AND categoria = %s
        """
        params = [usuario_id, categoria]
        
        if mes:
            query += " AND MONTH(data_recebimento) = %s"
            params.append(mes)
        
        if ano:
            query += " AND YEAR(data_recebimento) = %s"
            params.append(ano)
        
        result = execute_query(query, tuple(params), fetch_one=True)
        
        total_receita = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_receita:.2f}, {quantidade} receita(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "categoria": categoria,
            "mes": mes,
            "ano": ano,
            "total_receita": total_receita,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool
def consultar_total_receitas(usuario_id: int) -> str:
    """
    Consulta o total de todas as receitas de um usuário (todas as receitas já registradas).
    
    Args:
        usuario_id: ID do usuário
        
    Returns:
        JSON string com o total geral
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_total_receitas ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id} ---")
    
    try:
        query = """
            SELECT 
                COALESCE(SUM(valor_recebido), 0) AS total_receita,
                COUNT(*) AS quantidade
            FROM receitas
            WHERE usuario_id = %s
        """
        
        result = execute_query(query, (usuario_id,), fetch_one=True)
        
        total_receita = float(result[0]) if result and result[0] is not None else 0.0
        quantidade = int(result[1]) if result and result[1] is not None else 0
        
        print(f"--- ✔️ Resultado: Total R$ {total_receita:.2f}, {quantidade} receita(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "total_receita": total_receita,
            "quantidade": quantidade
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})

