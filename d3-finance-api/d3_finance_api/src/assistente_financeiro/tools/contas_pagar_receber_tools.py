"""
Ferramentas para consulta de contas a pagar e receber
"""
import json
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from ..database import execute_query


# ========== Schemas Pydantic ==========

class ConsultaContasPagarArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    status: Optional[str] = Field(None, description="Status: 'Pendente', 'Pago', 'Cancelado' (opcional)")
    mes: Optional[int] = Field(None, description="Mês de vencimento (1-12, opcional)")
    ano: Optional[int] = Field(None, description="Ano de vencimento (opcional)")


class ConsultaContasReceberArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    status: Optional[str] = Field(None, description="Status: 'Pendente', 'Recebido', 'Cancelado' (opcional)")
    mes: Optional[int] = Field(None, description="Mês previsto (1-12, opcional)")
    ano: Optional[int] = Field(None, description="Ano previsto (opcional)")


class ConsultaContasVencidasArgs(BaseModel):
    usuario_id: int = Field(..., description="ID do usuário")
    tipo: str = Field(..., description="Tipo: 'pagar' ou 'receber'")


# ========== Ferramentas ==========

@tool(args_schema=ConsultaContasPagarArgs)
def consultar_contas_pagar(usuario_id: int, status: Optional[str] = None, mes: Optional[int] = None, ano: Optional[int] = None) -> str:
    """
    Consulta contas a pagar de um usuário.
    Pode filtrar por status, mês e/ou ano de vencimento.
    
    Args:
        usuario_id: ID do usuário
        status: Status da conta (Pendente, Pago, Cancelado)
        mes: Mês de vencimento (1-12)
        ano: Ano de vencimento
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_contas_pagar ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, status={status}, mes={mes}, ano={ano} ---")
    
    try:
        query = """
            SELECT 
                id,
                descricao,
                valor,
                data_vencimento,
                categoria_despesa,
                status
            FROM contas_pagar
            WHERE usuario_id = %s
        """
        params = [usuario_id]
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        if mes:
            query += " AND MONTH(data_vencimento) = %s"
            params.append(mes)
        
        if ano:
            query += " AND YEAR(data_vencimento) = %s"
            params.append(ano)
        
        query += " ORDER BY data_vencimento ASC"
        
        results = execute_query(query, tuple(params))
        
        contas = []
        total_pendente = 0.0
        total_pago = 0.0
        
        for row in results:
            conta = {
                "id": int(row[0]),
                "descricao": row[1],
                "valor": float(row[2]),
                "data_vencimento": row[3].strftime("%Y-%m-%d") if row[3] else None,
                "categoria_despesa": row[4],
                "status": row[5]
            }
            contas.append(conta)
            
            if row[5] == "Pendente":
                total_pendente += float(row[2])
            elif row[5] == "Pago":
                total_pago += float(row[2])
        
        print(f"--- ✔️ Resultado: {len(contas)} conta(s), Pendente: R$ {total_pendente:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "contas": contas,
            "total_pendente": total_pendente,
            "total_pago": total_pago,
            "quantidade": len(contas)
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaContasReceberArgs)
def consultar_contas_receber(usuario_id: int, status: Optional[str] = None, mes: Optional[int] = None, ano: Optional[int] = None) -> str:
    """
    Consulta contas a receber de um usuário.
    Pode filtrar por status, mês e/ou ano previsto.
    
    Args:
        usuario_id: ID do usuário
        status: Status da conta (Pendente, Recebido, Cancelado)
        mes: Mês previsto (1-12)
        ano: Ano previsto
        
    Returns:
        JSON string com os resultados
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_contas_receber ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, status={status}, mes={mes}, ano={ano} ---")
    
    try:
        query = """
            SELECT 
                id,
                descricao,
                valor,
                data_prevista,
                categoria_receita,
                status
            FROM contas_receber
            WHERE usuario_id = %s
        """
        params = [usuario_id]
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        if mes:
            query += " AND MONTH(data_prevista) = %s"
            params.append(mes)
        
        if ano:
            query += " AND YEAR(data_prevista) = %s"
            params.append(ano)
        
        query += " ORDER BY data_prevista ASC"
        
        results = execute_query(query, tuple(params))
        
        contas = []
        total_pendente = 0.0
        total_recebido = 0.0
        
        for row in results:
            conta = {
                "id": int(row[0]),
                "descricao": row[1],
                "valor": float(row[2]),
                "data_prevista": row[3].strftime("%Y-%m-%d") if row[3] else None,
                "categoria_receita": row[4],
                "status": row[5]
            }
            contas.append(conta)
            
            if row[5] == "Pendente":
                total_pendente += float(row[2])
            elif row[5] == "Recebido":
                total_recebido += float(row[2])
        
        print(f"--- ✔️ Resultado: {len(contas)} conta(s), Pendente: R$ {total_pendente:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "contas": contas,
            "total_pendente": total_pendente,
            "total_recebido": total_recebido,
            "quantidade": len(contas)
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})


@tool(args_schema=ConsultaContasVencidasArgs)
def consultar_contas_vencidas(usuario_id: int, tipo: str) -> str:
    """
    Consulta contas a pagar ou receber que estão vencidas (data passada e status pendente).
    
    Args:
        usuario_id: ID do usuário
        tipo: Tipo de conta - 'pagar' ou 'receber'
        
    Returns:
        JSON string com as contas vencidas
    """
    print(f"\n--- 🤖 EXECUTANDO: consultar_contas_vencidas ---")
    print(f"--- 🧰 Parâmetros: usuario_id={usuario_id}, tipo={tipo} ---")
    
    try:
        hoje = date.today()
        
        if tipo.lower() == "pagar":
            query = """
                SELECT 
                    id,
                    descricao,
                    valor,
                    data_vencimento,
                    categoria_despesa
                FROM contas_pagar
                WHERE usuario_id = %s
                    AND status = 'Pendente'
                    AND data_vencimento < %s
                ORDER BY data_vencimento ASC
            """
            campo_data = "data_vencimento"
        elif tipo.lower() == "receber":
            query = """
                SELECT 
                    id,
                    descricao,
                    valor,
                    data_prevista,
                    categoria_receita
                FROM contas_receber
                WHERE usuario_id = %s
                    AND status = 'Pendente'
                    AND data_prevista < %s
                ORDER BY data_prevista ASC
            """
            campo_data = "data_prevista"
        else:
            return json.dumps({"erro": "Tipo deve ser 'pagar' ou 'receber'"})
        
        results = execute_query(query, (usuario_id, hoje))
        
        contas = []
        total_vencido = 0.0
        
        for row in results:
            if tipo.lower() == "pagar":
                conta = {
                    "id": int(row[0]),
                    "descricao": row[1],
                    "valor": float(row[2]),
                    "data_vencimento": row[3].strftime("%Y-%m-%d") if row[3] else None,
                    "categoria": row[4]
                }
            else:
                conta = {
                    "id": int(row[0]),
                    "descricao": row[1],
                    "valor": float(row[2]),
                    "data_prevista": row[3].strftime("%Y-%m-%d") if row[3] else None,
                    "categoria": row[4]
                }
            
            contas.append(conta)
            total_vencido += float(row[2])
        
        print(f"--- ✔️ Resultado: {len(contas)} conta(s) vencida(s), Total: R$ {total_vencido:.2f} ---\n")
        
        return json.dumps({
            "usuario_id": usuario_id,
            "tipo": tipo,
            "contas_vencidas": contas,
            "total_vencido": total_vencido,
            "quantidade": len(contas)
        })
        
    except Exception as e:
        print(f"--- ❌ Erro: {e} ---")
        return json.dumps({"erro": str(e)})

