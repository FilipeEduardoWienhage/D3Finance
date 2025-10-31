"""
Schemas para o Assistente Financeiro
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class MensagemAssistenteRequest(BaseModel):
    """Schema para requisição de pergunta ao assistente"""
    pergunta: str = Field(..., description="Pergunta do usuário em linguagem natural")
    manter_contexto: bool = Field(True, description="Se True, mantém o histórico da conversa")


class QueryExecutada(BaseModel):
    """Schema para uma query SQL executada"""
    nome_ferramenta: str = Field(..., description="Nome da ferramenta executada")
    query_sql: str = Field(..., description="Query SQL executada")
    parametros: dict = Field(..., description="Parâmetros passados para a query")


class MensagemAssistenteResponse(BaseModel):
    """Schema para resposta do assistente"""
    pergunta: str = Field(..., description="Pergunta original do usuário")
    resposta: str = Field(..., description="Resposta do assistente em linguagem natural")
    queries_executadas: List[QueryExecutada] = Field(default_factory=list, description="Queries SQL executadas")
    usuario_id: int = Field(..., description="ID do usuário que fez a pergunta")
    
    class Config:
        json_schema_extra = {
            "example": {
                "pergunta": "Quanto eu gastei em outubro?",
                "resposta": "Em outubro de 2025, você gastou um total de R$ 1.234,56. Isso representa 12 despesas registradas.",
                "queries_executadas": [
                    {
                        "nome_ferramenta": "consultar_despesas_por_mes",
                        "query_sql": "SELECT COALESCE(SUM(valor_pago), 0) AS total_gasto, COUNT(*) AS quantidade FROM despesas WHERE usuario_id = %s AND MONTH(data_pagamento) = %s AND YEAR(data_pagamento) = %s",
                        "parametros": {
                            "usuario_id": 1,
                            "mes": 10,
                            "ano": 2025
                        }
                    }
                ],
                "usuario_id": 1
            }
        }

