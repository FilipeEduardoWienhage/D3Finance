from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CriarAssinaturaRequest(BaseModel):
    plano: str  # Mensal, Semestral, Anual

class AssinaturaResponse(BaseModel):
    checkout_url: str
    session_id: str

class StatusAssinatura(BaseModel):
    plano: str
    status: str
    preco: float
    periodo_teste: bool
    data_inicio: datetime
    data_fim: Optional[datetime]
    data_teste_fim: Optional[datetime]
    