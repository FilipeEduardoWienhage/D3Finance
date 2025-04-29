from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


@dataclass
class DespesaBase:
    categoria: str
    nome_despesa: str
    valor_pago: float
    data_pagamento: date
    forma_pagamento: str
    descricao: Optional[str] = None


@dataclass
class DespesaCreate(DespesaBase):
    pass


@dataclass
class DespesaUpdate:
    categoria: Optional[str] = None
    nome_despesa: Optional[str] = None
    valor_pago: Optional[float] = None
    data_pagamento: Optional[date] = None
    forma_pagamento: Optional[str] = None
    descricao: Optional[str] = None


@dataclass
class DespesaResponse:
    id: int
    categoria: str
    nome_despesa: str
    valor_pago: float
    data_pagamento: date
    forma_pagamento: str
    descricao: Optional[str] = None
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None