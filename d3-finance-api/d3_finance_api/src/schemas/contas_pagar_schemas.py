from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel
from pydantic.dataclasses import dataclass


@dataclass
class ContaPagarBase:
    valor: float
    data_vencimento: date
    categoria_despesa: str
    forma_pagamento: str
    conta_id: int
    descricao: Optional[str] = None


@dataclass
class ContaPagarCreate(ContaPagarBase):
    pass


@dataclass
class ContaPagarUpdate:
    descricao: Optional[str] = None
    valor: Optional[float] = None
    data_vencimento: Optional[date] = None
    categoria_despesa: Optional[str] = None
    forma_pagamento: Optional[str] = None
    conta_id: Optional[int] = None


@dataclass
class ContaPagarResponse:
    id: int
    valor: float
    data_vencimento: date
    categoria_despesa: str
    forma_pagamento: str
    status: str
    conta_id: int
    descricao: Optional[str] = None
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None


@dataclass
class ContaPagarPaginatedResponse:
    items: list[ContaPagarResponse]
    total: int
    page: int
    size: int