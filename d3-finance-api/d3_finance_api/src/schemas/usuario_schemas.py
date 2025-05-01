from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


# Base comum para criação e resposta de usuários
@dataclass
class UsuarioBase:
    name: str
    email: str
    cpf: str
    data_nascimento: date
    sexo: str
    profissao: str
    cnpj: str
    razao_social: str
    cep: str
    estado: str
    cidade: str
    bairro: str
    usuario: str


# Para criação de usuário, adiciona o campo de senha
@dataclass
class UsuarioCreate(UsuarioBase):
    senha: str


# Para atualização, todos os campos são opcionais
@dataclass
class UsuarioUpdate:
    name: Optional[str] = None
    email: Optional[str] = None
    cpf: Optional[str] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    profissao: Optional[str] = None
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    cep: Optional[str] = None
    estado: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    usuario: Optional[str] = None
    senha: Optional[str] = None


# Para resposta da API, inclui o ID
@dataclass
class UsuarioResponse(UsuarioBase):
    id: int
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None