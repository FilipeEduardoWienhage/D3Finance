from typing import Optional
from datetime import datetime
from pydantic.dataclasses import dataclass

@dataclass
class TransacoesBase:
    conta_origem_id: int
    conta_destino_id: int
    valor: float
    descricao: Optional[str] = None

@dataclass
class TransacoesCreate(TransacoesBase):
    pass

@dataclass
class TransacoesUpdate:
    conta_origem_id: Optional[int] = None
    conta_destino_id: Optional[int] = None
    valor: Optional[float] = None
    descricao: Optional[str] = None

@dataclass
class TransacoesResponse:
    id: int
    conta_origem_id: int
    conta_destino_id: int
    valor: float
    data_transacao: datetime
    descricao: Optional[str] = None
