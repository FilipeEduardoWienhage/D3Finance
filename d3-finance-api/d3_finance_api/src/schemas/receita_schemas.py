from typing import Optional
from datetime import date
from pydantic.dataclasses import dataclass


@dataclass
class ReceitaBase:
    id: int
    categoria: str
    nome_receita: str
    valor_recebido: float
    data_recebimento: date
    forma_recebimento: str
    descricao: Optional[str] = None


@dataclass
class ReceitaCreate(ReceitaBase):
    pass


@dataclass
class ReceitaUpdate:
    categoria: Optional[str] = None
    nome_receita: Optional[str] = None
    valor_recebido: Optional[float] = None
    data_recebimento: Optional[date] = None
    descricao: Optional[str] = None
    forma_recebimento: Optional[str] = None


@dataclass
class ReceitaResponse(ReceitaBase):
    id: int
