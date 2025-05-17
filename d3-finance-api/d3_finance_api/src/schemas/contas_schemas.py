from typing import Optional
from datetime import datetime
from pydantic.dataclasses import dataclass

@dataclass
class ContaBase:
    tipo_conta: str
    nome_conta: str

@dataclass
class ContaCreate(ContaBase):
    saldo: Optional[float] = 0.0

@dataclass
class ContaUpdate:
    tipo_conta: Optional[str] = None
    nome_conta: Optional[str] = None
    saldo: Optional[float] = None

@dataclass
class ContaResponse(ContaBase):
    id: int
    saldo: float = 0.0
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None
