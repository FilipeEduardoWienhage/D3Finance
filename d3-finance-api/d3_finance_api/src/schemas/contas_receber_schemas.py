from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel
from pydantic.dataclasses import dataclass


@dataclass
class ContaReceberBase:
    valor: float
    data_prevista: date
    categoria_receita: str
    forma_recebimento: str
    conta_id: int
    descricao: Optional[str] = None


@dataclass
class ContaReceberCreate(ContaReceberBase):
    pass


@dataclass
class ContaReceberUpdate:
    descricao: Optional[str] = None
    valor: Optional[float] = None
    data_prevista: Optional[date] = None
    categoria_receita: Optional[str] = None
    forma_recebimento: Optional[str] = None
    conta_id: Optional[int] = None
    status: Optional[str] = None


@dataclass
class ContaReceberResponse:
    id: int
    valor: float
    data_prevista: date
    categoria_receita: str
    forma_recebimento: str
    status: str
    conta_id: int
    descricao: Optional[str] = None
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None


class ContaReceberCategoriaResponse(BaseModel):
    categoria: str
    total_valor: float
    quantidade: int
