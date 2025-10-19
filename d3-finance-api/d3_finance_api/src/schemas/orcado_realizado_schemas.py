from typing import List
from pydantic import BaseModel


class OrcadoRealizadoMensal(BaseModel):
    mes: int
    orcado: float
    realizado: float
    diferenca: float

    class Config:
        from_attributes = True


class OrcadoRealizadoResponse(BaseModel):
    ano: int
    total_orcado: float
    total_realizado: float
    total_diferenca: float
    dados_mensais: List[OrcadoRealizadoMensal]

    class Config:
        from_attributes = True

