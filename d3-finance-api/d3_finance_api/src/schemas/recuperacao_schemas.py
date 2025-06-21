from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EnviarCodigoRequest(BaseModel):
    email: EmailStr

class EnviarCodigoResponse(BaseModel):
    message: str
    success: bool

class ValidarCodigoRequest(BaseModel):
    email: EmailStr
    codigo: str

class ValidarCodigoResponse(BaseModel):
    message: str
    success: bool
    token: Optional[str] = None

class AlterarSenhaRequest(BaseModel):
    email: EmailStr
    codigo: str
    nova_senha: str

class AlterarSenhaResponse(BaseModel):
    message: str
    success: bool
    
class CodigoRecuperacaoResponse(BaseModel):
    id: int
    email: str
    codigo: str
    expiracao: datetime
    usado: bool
    data_criacao: datetime
