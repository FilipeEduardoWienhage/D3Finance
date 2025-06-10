from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from src.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def gerar_hash_senha(senha: str) -> str:
    """Gera um hash da senha fornecida."""
    return pwd_context.hash(senha)


def verificar_senha(senha: str, hash_senha: str) -> bool:
    """Verifica se a senha fornecida corresponde ao hash da senha."""
    return pwd_context.verify(senha, hash_senha)

def criar_token_acesso(usuario_id: int) -> str:
    """Cria um token de acesso JWT para o usuário."""
    data_expiracao = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    dados = {
        "sub": str(usuario_id), # 'sub' é um padrão comum para o assunto do token (subject)
        "exp": data_expiracao
    }
    return jwt.encode(dados, SECRET_KEY, algorithm=ALGORITHM)