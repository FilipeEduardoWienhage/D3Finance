from datetime import datetime, timedelta, timezone
import os
from typing import List
from fastapi import HTTPException, Depends, status, Response
import jwt
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Usuario
from src.api.tags import Tag
from src.schemas.usuario_schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from src.schemas.autenticacao_schemas import AutenticacaoLogin, Token
from src.utils.auth_utils import gerar_hash_senha, verificar_senha
from sqlalchemy.exc import IntegrityError
from src.services.autenticacao_service import generate_token
from src.utils.notification_utils import send_notification_background

AUTENTICACAO_LOGIN = "/v1/autenticacao"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    path=AUTENTICACAO_LOGIN, response_model=Token, tags=[Tag.Autenticacao.name]
)
def create_user(form: AutenticacaoLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.usuario == form.usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login ou senha inválidos",
        )
    if not verificar_senha(senha=form.senha, hash_senha=usuario.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login ou senha inválidos",
        )
    access_token, access_token_expires = generate_token(usuario)
    return Token(access=access_token, token_type="bearer")
