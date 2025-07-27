from typing import Optional
from datetime import datetime
from pydantic.dataclasses import dataclass
from pydantic import validator, Field

@dataclass
class TransacoesBase:
    conta_origem_id: int
    conta_destino_id: int
    valor: float = Field(gt=0, description="O valor deve ser maior que zero")
    descricao: Optional[str] = None

    @validator('conta_destino_id')
    def contas_diferentes(cls, v, values):
        if 'conta_origem_id' in values and v == values['conta_origem_id']:
            raise ValueError('A conta origem e a conta destino não podem ser a mesma')
        return v

@dataclass
class TransacoesCreate(TransacoesBase):
    pass

@dataclass
class TransacoesUpdate:
    conta_origem_id: Optional[int] = None
    conta_destino_id: Optional[int] = None
    valor: Optional[float] = Field(None, gt=0, description="O valor deve ser maior que zero")
    descricao: Optional[str] = None

    @validator('conta_destino_id')
    def contas_diferentes_update(cls, v, values):
        if v is not None and 'conta_origem_id' in values and values['conta_origem_id'] is not None:
            if v == values['conta_origem_id']:
                raise ValueError('A conta origem e a conta destino não podem ser a mesma')
        return v

@dataclass
class TransacoesResponse:
    id: int
    conta_origem_id: int
    conta_destino_id: int
    valor: float
    data_transacao: datetime
    descricao: Optional[str] = None
