from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


@dataclass
class DespesaBase:
    categoria: str
    valor_pago: float
    data_pagamento: date
    forma_pagamento: str
    conta_id: int
    descricao: Optional[str] = None



@dataclass
class DespesaCreate(DespesaBase):
    pass


@dataclass
class DespesaUpdate:
    categoria: Optional[str] = None
    valor_pago: Optional[float] = None
    data_pagamento: Optional[date] = None
    forma_pagamento: Optional[str] = None
    descricao: Optional[str] = None


@dataclass
class DespesaResponse:
    id: int
    categoria: str
    valor_pago: float
    data_pagamento: date
    forma_pagamento: str
    conta_id: int
    descricao: Optional[str] = None
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None
