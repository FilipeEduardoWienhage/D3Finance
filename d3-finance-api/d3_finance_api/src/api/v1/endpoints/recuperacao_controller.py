import random
import string
from datetime import datetime, timedelta
from typing import Annotated
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from src.app import router
from src.database.database import SessionLocal
from src.database.models import CodigoRecuperacao, Usuario
from src.api.tags import Tag
from src.schemas.recuperacao_schemas import (
    EnviarCodigoRequest, EnviarCodigoResponse,
    ValidarCodigoRequest, ValidarCodigoResponse,
    AlterarSenhaRequest, AlterarSenhaResponse
)
from src.services.email_service import EmailService
from src.utils.auth_utils import gerar_hash_senha

# Endpoints
ENVIAR_CODIGO = "/v1/recuperar-senha/enviar-codigo"
VALIDAR_CODIGO = "/v1/recuperar-senha/validar-codigo"
ALTERAR_SENHA = "/v1/recuperar-senha/alterar-senha"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def gerar_codigo_otp() -> str:
    """Gera um código OTP de 4 dígitos"""
    return ''.join(random.choices(string.digits, k=4))


def limpar_codigos_antigos(db: Session, email: str):
    """Remove códigos antigos e expirados do usuário"""
    agora = datetime.utcnow()
    db.query(CodigoRecuperacao).filter(
        and_(
            CodigoRecuperacao.email == email,
            or_(
                CodigoRecuperacao.expiracao < agora,
                CodigoRecuperacao.usado == True
            )
        )
    ).delete()
    db.commit()

@router.post(
    path=ENVIAR_CODIGO,
    response_model=EnviarCodigoResponse,
    tags=[Tag.Autenticacao.name]
)
def enviar_codigo_recuperacao(
    request: EnviarCodigoRequest,
    db: Session = Depends(get_db)
):
    """
    Envia código OTP para recuperação de senha
    """
    try:
        # Verificar se o email existe no sistema
        usuario = db.query(Usuario).filter(Usuario.email == request.email).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email não encontrado no sistema."
            )
        
        # Limpar códigos antigos
        limpar_codigos_antigos(db, request.email)
        
        # Gerar novo código
        codigo = gerar_codigo_otp()
        expiracao = datetime.utcnow() + timedelta(minutes=10)
        
        # Salvar código no banco
        codigo_recuperacao = CodigoRecuperacao(
            email=request.email,
            codigo=codigo,
            expiracao=expiracao
        )
        
        db.add(codigo_recuperacao)
        db.commit()
        db.refresh(codigo_recuperacao)
        
        # Enviar email
        email_service = EmailService()
        sucesso = email_service.enviar_codigo_otp(
            request.email, 
            codigo, 
            usuario.name
        )
        
        if not sucesso:
            # Se falhar ao enviar email, remover o código
            db.delete(codigo_recuperacao)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar email. Tente novamente."
            )
        
        return EnviarCodigoResponse(
            message="Código enviado com sucesso para seu email.",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor."
        )

@router.post(
    path=VALIDAR_CODIGO,
    response_model=ValidarCodigoResponse,
    tags=[Tag.Autenticacao.name]
)
def validar_codigo_recuperacao(
    request: ValidarCodigoRequest,
    db: Session = Depends(get_db)
):
    """
    Valida código OTP para recuperação de senha
    """
    try:
        agora = datetime.utcnow()
        
        # Buscar código válido
        codigo_recuperacao = db.query(CodigoRecuperacao).filter(
            and_(
                CodigoRecuperacao.email == request.email,
                CodigoRecuperacao.codigo == request.codigo,
                CodigoRecuperacao.expiracao > agora,
                CodigoRecuperacao.usado == False
            )
        ).first()
        
        if not codigo_recuperacao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código inválido ou expirado."
            )
        
        # Marcar código como usado
        codigo_recuperacao.usado = True
        db.commit()
        
        return ValidarCodigoResponse(
            message="Código validado com sucesso.",
            success=True,
            token=codigo_recuperacao.codigo  # Usar código como token temporário
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor."
        )

@router.post(
    path=ALTERAR_SENHA,
    response_model=AlterarSenhaResponse,
    tags=[Tag.Autenticacao.name]
)
def alterar_senha_recuperacao(
    request: AlterarSenhaRequest,
    db: Session = Depends(get_db)
):
    """
    Altera senha usando código OTP
    """
    try:
        # Verificar se o código foi usado recentemente
        codigo_recuperacao = db.query(CodigoRecuperacao).filter(
            and_(
                CodigoRecuperacao.email == request.email,
                CodigoRecuperacao.codigo == request.codigo,
                CodigoRecuperacao.usado == True
            )
        ).first()
        
        if not codigo_recuperacao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código inválido ou não validado."
            )
        
        # Verificar se não expirou (dar 5 minutos extras após validação)
        if codigo_recuperacao.expiracao + timedelta(minutes=5) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código expirado. Solicite um novo código."
            )
        
        # Buscar usuário
        usuario = db.query(Usuario).filter(Usuario.email == request.email).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado."
            )
        
        # Validar nova senha
        if len(request.nova_senha) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A senha deve ter pelo menos 8 caracteres."
            )
        
        # Alterar senha
        senha_hash = gerar_hash_senha(request.nova_senha)
        usuario.senha = senha_hash
        db.commit()
        
        # Enviar email de confirmação
        email_service = EmailService()
        email_service.enviar_confirmacao_senha_alterada(
            request.email, 
            usuario.name
        )
        
        return AlterarSenhaResponse(
            message="Senha alterada com sucesso.",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor."
        )
