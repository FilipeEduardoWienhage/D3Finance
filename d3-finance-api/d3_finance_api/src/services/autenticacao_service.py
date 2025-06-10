from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
import jwt
from datetime import datetime, timedelta, timezone
import os
from typing import Annotated, List
from fastapi import HTTPException, Depends, status, Response
import jwt
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Usuario
from src.api.tags import Tag
from src.schemas.usuario_schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from src.schemas.autenticacao_schemas import AutenticacaoLogin, Token, TokenData
from src.utils.auth_utils import gerar_hash_senha, verificar_senha
from sqlalchemy.exc import IntegrityError


ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Tempo de expiração do token em minutos
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY")  # Substitua por uma chave secreta segura

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/autenticacao")

def generate_token(usuario):
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.usuario, "id": usuario.id}, expires_delta=access_token_expires
    )

    return access_token, access_token_expires

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(usuario=username, id=payload.get("id"))
    except InvalidTokenError:
        raise credentials_exception
    return token_data