from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field


class CategoriaValor(BaseModel):
    categoria: str
    valor: float

    class Config:       
        from_attributes = True

class ContaValor(BaseModel):
    conta: str
    valor: float

    class Config:
        from_attributes = True

class DadosMensais(BaseModel):
    mes: int
    receitas: float
    despesas: float
    saldo_periodo: float

    class Config:
        from_attributes = True

class RelatorioMensalResponse(BaseModel):
    periodo_inicio: date
    periodo_fim: date
    total_receitas: float
    total_despesas: float
    saldo_periodo: float
    receitas_por_categoria: List[CategoriaValor]
    despesas_por_categoria: List[CategoriaValor]
    receitas_por_conta: List[ContaValor]
    despesas_por_conta: List[ContaValor]
    quantidade_receitas: int
    quantidade_despesas: int

    class Config:
        from_attributes = True

class RelatorioAnualResponse(BaseModel):
    ano: int
    total_receitas: float
    total_despesas: float
    saldo_periodo: float
    dados_mensais: List[DadosMensais]
    receitas_por_conta: List[ContaValor]
    despesas_por_conta: List[ContaValor]

    class Config:
        from_attributes = True


