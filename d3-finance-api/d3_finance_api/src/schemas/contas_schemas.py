from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


@dataclass
class ContaBase:
    tipo_conta: str
    nome_conta: str


@dataclass
class ContaCreate(ContaBase):
    pass


@dataclass
class ContaUpdate:
    tipo_conta: Optional[str] = None
    nome_conta: Optional[str] = None


@dataclass
class ContaResponse:
    id: int
    tipo_conta: str
    nome_conta: str
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None