from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def gerar_hash_senha(senha: str) -> str:
    "Gera um hash da senha fornecida."
    return pwd_context.hash(senha)


def verificar_senha(senha: str, hash_senha: str) -> bool:
    "Verifica se a senha fornecida corresponde ao hash da senha."
    return pwd_context.verify(senha, hash_senha)