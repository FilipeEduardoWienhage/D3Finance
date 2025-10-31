"""
Ferramentas para consulta de contas bancárias
"""
import json
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from ..database import execute_query


# ========== Schemas Pydantic ==========

class ConsultaContasArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")


class ConsultaSaldoContasArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    conta_id: Optional[int] = Field(None, description="ID da conta específica (opcional)")


class ConsultaMovimentacoesContaArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    conta_id: int = Field(..., description="ID da conta")
    mes: Optional[int] = Field(None, description="Mês específico (1-12, opcional)")
    ano: Optional[int] = Field(None, description="Ano específico (opcional)")


# ========== Ferramentas ==========

@tool(args_schema=ConsultaContasArgs)
def consultar_contas_usuario(usuario_id: int) -> str:
    """
    Lista todas as contas bancárias de um usuário.
    
    Args:
        usuario_id: ID do usuário
        
    Returns:
        JSON string com a lista de contas
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_contas_usuario ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id} ---")
    
    try:
        query = """
            SELECT 
                id,
                tipo_conta,
                nome_conta,
                saldo
            FROM contas
            WHERE usuario_id = %s
            ORDER BY nome_conta
        """
        
        results = execute_query(query, (usuario_id,))
        
        contas = []
        for row in results:
            contas.append({
                "id": int(row[0]),
                "tipo_conta": row[1],
                "nome_conta": row[2],
                "saldo": float(row[3])
            })
        
        print(f"--- ✔️ Resultado: {len(contas)} conta(s) encontrada(s) ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "contas": contas,
            "total_contas": len(contas)
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaSaldoContasArgs)
def consultar_saldo_contas(usuario_id: int, conta_id: Optional[int] = None) -> str:
    """
    Consulta o saldo de uma ou todas as contas de um usuário.
    
    Args:
        usuario_id: ID do usuário
        conta_id: ID da conta específica (opcional). Se não informado, retorna todas as contas.
        
    Returns:
        JSON string com o(s) saldo(s)
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_saldo_contas ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, conta_id={conta_id} ---")
    
    try:
        if conta_id:
            # Saldo de uma conta específica
            query = """
                SELECT 
                    id,
                    nome_conta,
                    saldo,
                    tipo_conta
                FROM contas
                WHERE usuario_id = %s AND id = %s
            """
            results = execute_query(query, (usuario_id, conta_id))
            
            if results:
                row = results[0]
                conta = {
                    "id": int(row[0]),
                    "nome_conta": row[1],
                    "saldo": float(row[2]),
                    "tipo_conta": row[3]
                }
                print(f"--- ✔️ Resultado: Saldo R$ {conta['saldo']:.2f} ---\n")
                return json.dumps({"usuario_id": usuario_id, "conta": conta})
            else:
                return json.dumps({"erro": "Conta não encontrada"})
        else:
            # Saldo de todas as contas
            query = """
                SELECT 
                    id,
                    nome_conta,
                    saldo,
                    tipo_conta,
                    SUM(saldo) OVER () as saldo_total
                FROM contas
                WHERE usuario_id = %s
                ORDER BY nome_conta
            """
            results = execute_query(query, (usuario_id,))
            
            contas = []
            saldo_total = 0.0
            
            for row in results:
                contas.append({
                    "id": int(row[0]),
                    "nome_conta": row[1],
                    "saldo": float(row[2]),
                    "tipo_conta": row[3]
                })
                saldo_total += float(row[2])
            
            print(f"--- ✔️ Resultado: Saldo total R$ {saldo_total:.2f} ---\n")
            
            return json.dumps({
                "usuario_id": usuario_id,
                "contas": contas,
                "saldo_total": saldo_total
            })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaMovimentacoesContaArgs)
def consultar_movimentacoes_conta(usuario_id: int, conta_id: int, mes: Optional[int] = None, ano: Optional[int] = None) -> str:
    """
    Consulta movimentações (despesas e receitas) de uma conta específica.
    Pode filtrar por mês e/ou ano.
    
    Args:
        usuario_id: ID do usuário
        conta_id: ID da conta
        mes: Mês específico (opcional, 1-12)
        ano: Ano específico (opcional)
        
    Returns:
        JSON string com as movimentações
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_movimentacoes_conta ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, conta_id={conta_id}, mes={mes}, ano={ano} ---")
    
    try:
        # Consulta despesas da conta
        query_despesas = """
            SELECT 
                COALESCE(SUM(valor_pago), 0) AS total_despesas,
                COUNT(*) AS qtd_despesas
            FROM despesas
            WHERE usuario_id = %s AND conta_id = %s
        """
        params_despesas = [usuario_id, conta_id]
        
        # Consulta receitas da conta
        query_receitas = """
            SELECT 
                COALESCE(SUM(valor_recebido), 0) AS total_receitas,
                COUNT(*) AS qtd_receitas
            FROM receitas
            WHERE usuario_id = %s AND conta_id = %s
        """
        params_receitas = [usuario_id, conta_id]
        
        if mes:
            query_despesas += " AND MONTH(data_pagamento) = %s"
            query_receitas += " AND MONTH(data_recebimento) = %s"
            params_despesas.append(mes)
            params_receitas.append(mes)
        
        if ano:
            query_despesas += " AND YEAR(data_pagamento) = %s"
            query_receitas += " AND YEAR(data_recebimento) = %s"
            params_despesas.append(ano)
            params_receitas.append(ano)
        
        result_despesas = execute_query(query_despesas, tuple(params_despesas), fetch_one=True)
        result_receitas = execute_query(query_receitas, tuple(params_receitas), fetch_one=True)
        
        total_despesas = float(result_despesas[0]) if result_despesas and result_despesas[0] else 0.0
        qtd_despesas = int(result_despesas[1]) if result_despesas and result_despesas[1] else 0
        
        total_receitas = float(result_receitas[0]) if result_receitas and result_receitas[0] else 0.0
        qtd_receitas = int(result_receitas[1]) if result_receitas and result_receitas[1] else 0
        
        saldo_periodo = total_receitas - total_despesas
        
        print(f"--- ✔️ Resultado: Despesas R$ {total_despesas:.2f}, Receitas R$ {total_receitas:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "conta_id": conta_id,
            "mes": mes,
            "ano": ano,
            "despesas": {
                "total": total_despesas,
                "quantidade": qtd_despesas
            },
            "receitas": {
                "total": total_receitas,
                "quantidade": qtd_receitas
            },
            "saldo_periodo": saldo_periodo
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})

