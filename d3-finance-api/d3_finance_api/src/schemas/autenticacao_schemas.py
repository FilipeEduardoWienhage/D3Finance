from typing import Optional
from datetime import date, datetime
from pydantic.dataclasses import dataclass


@dataclass
class AutenticacaoLogin:
    usuario: str
    senha: str

@dataclass
class Token:
    access: str
    token_type: str


@dataclass
class TokenData:
    id: int
    usuario: str
    exp: Optional[datetime] = None