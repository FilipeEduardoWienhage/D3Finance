from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


@dataclass
class ContaBase:
    banco: str
    numero_conta: str
    agencia: str


@dataclass
class ContaCreate(ContaBase):
    pass


@dataclass
class ContaUpdate:
    banco: Optional[str] = None
    numero_conta: Optional[str] = None
    agencia: Optional[str] = None


@dataclass
class ContaResponse:
    id: int
    banco: str
    numero_conta: str
    agencia: str
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None