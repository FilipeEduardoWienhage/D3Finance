from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


# Base comum para criação e resposta de usuários
@dataclass
class AutenticacaoLogin:
    usuario: str
    senha: str

@dataclass
class Token:
    access_token: str
    token_type: str


@dataclass
class TokenData:
    id: int
    usuario: str
    exp: Optional[datetime] = None