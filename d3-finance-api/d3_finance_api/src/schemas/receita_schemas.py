from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel
from pydantic.dataclasses import dataclass


@dataclass
class ReceitaBase:

    categoria: str
    valor_recebido: float
    data_recebimento: date
    forma_recebimento: str
    conta_id: int
    descricao: Optional[str] = None


@dataclass
class ReceitaCreate(ReceitaBase):
    pass


@dataclass
class ReceitaUpdate:
    categoria: Optional[str] = None
    valor_recebido: Optional[float] = None
    data_recebimento: Optional[date] = None
    descricao: Optional[str] = None
    forma_recebimento: Optional[str] = None
    conta_id: Optional[int] = None


@dataclass
class ReceitaResponse:
    id: int
    categoria: str
    valor_recebido: float
    data_recebimento: date
    forma_recebimento: str
    conta_id: int
    descricao: Optional[str] = None
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None



class ReceitaCategoriaResponse(BaseModel):
    categoria: str
    valor: float

    class Config:
        from_attributes = True 


class ReceitaMensalResponse(BaseModel):
    mes: int
    valor: float

    class Config:
        from_attributes = True