from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.database import get_db
from src.schemas.usuario_schemas import UserLogin
from src.schemas.token_schemas import TokenResponse
from src.utils.auth_utils import verificar_senha, criar_token_acesso
from src.database.models import Usuario  

router = APIRouter()

# Função auxiliar para buscar usuário por nome de usuário (campo 'usuario' no seu model)
def buscar_usuario_por_usuario(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.usuario == username).first()

@router.post("/login", response_model=TokenResponse)
def login(usuario_login: UserLogin, db: Session = Depends(get_db)):
    """
    Endpoint para autenticação de usuário.
    Retorna um token JWT se as credenciais forem válidas.
    """
    # Usando usuario_login.usuario para buscar, assumindo que é o campo de login
    usuario_db = buscar_usuario_por_usuario(db, usuario_login.usuario)

    if not usuario_db or not verificar_senha(usuario_login.senha, usuario_db.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha inválidos."
        )

    # Cria o token de acesso para o ID do usuário
    token = criar_token_acesso(usuario_db.id)
    return {"access_token": token, "token_type": "bearer"}