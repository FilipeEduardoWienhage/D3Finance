from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from src.core.config import SECRET_KEY, ALGORITHM

class JWTBearer(HTTPBearer):
    async def __call__(self, request: Request) -> dict:
        """
        Verifica a presença e validade do token JWT na requisição.
        Retorna o payload decodificado se o token for válido.
        """
        credenciais: HTTPAuthorizationCredentials = await super().__call__(request)
        if not credenciais:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Credenciais de autenticação ausentes ou inválidas."
            )
        
        payload = self.verificar_jwt(credenciais.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token de autenticação inválido ou expirado."
            )
        return payload

    def verificar_jwt(self, token: str) -> dict | None:
        """
        Decodifica e valida um token JWT.
        Retorna o payload do token ou None se houver um erro.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None