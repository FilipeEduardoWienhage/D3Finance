from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field


class CategoriaValor(BaseModel):
    categoria: str
    valor: float

    class Config:       
        from_attributes = True

class DadosMensais(BaseModel):
    mes: int
    receitas: float
    despesas: float
    saldo: float

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
    quantidade_receitas: int
    quantidade_despesas: int

    class Config:
        from_attributes = True

class RelatorioAnualResponse(BaseModel):
    ano: int
    total_receitas: float
    total_despesas: float
    saldo_ano: float
    dados_mensais: List[DadosMensais]

    class Config:
        from_attributes = True

class RelatorioPersonalizadoRequest(BaseModel):
    titulo: str = Field(..., description="Título do relatório")
    conteudo: str = Field(..., description="Conteúdo principal do relatório")
    dados_adicionais: Optional[str] = Field(None, description="Dados adicionais relevantes")
    conclusoes: Optional[str] = Field(None, description="Conclusões do relatório")

class RelatorioPersonalizadoResponse(BaseModel):
    titulo: str
    conteudo: str
    dados_adicionais: Optional[str]
    conclusoes: Optional[str]
    data_geracao: datetime

    class Config:
        from_attributes = True
