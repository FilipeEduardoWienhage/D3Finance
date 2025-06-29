from typing import Annotated, Optional
from fastapi import HTTPException, Depends, status, Response, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.app import router
from src.database.database import SessionLocal
from src.database.models import TelegramConfig, Usuario
from src.api.tags import Tag
from src.schemas.telegram_schemas import (
    TelegramConfigCreate, 
    TelegramConfigResponse, 
    TelegramConfigUpdate,
    TelegramTestMessage,
    TelegramNotificationResponse
)
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.services.telegram_service import telegram_service
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Endpoints
CONFIG_TELEGRAM = "/v1/telegram/config"
TEST_TELEGRAM = "/v1/telegram/test"
GET_CONFIG_TELEGRAM = "/v1/telegram/config"
UPDATE_CONFIG_TELEGRAM = "/v1/telegram/config"
DELETE_CONFIG_TELEGRAM = "/v1/telegram/config"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    path=CONFIG_TELEGRAM, 
    response_model=TelegramConfigResponse, 
    tags=[Tag.Telegram.name]
)
def create_telegram_config(
    config: TelegramConfigCreate, 
    usuario_logado: Annotated[TokenData, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    """
    Configura a integração com Telegram para o usuário
    """
    try:
        # Verifica se já existe configuração para o usuário
        existing_config = db.query(TelegramConfig).filter(
            TelegramConfig.usuario_id == usuario_logado.id
        ).first()
        
        if existing_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário já possui configuração do Telegram. Use PUT para atualizar."
            )
        
        # Cria nova configuração
        db_config = TelegramConfig(
            usuario_id=usuario_logado.id,
            chat_id=config.chat_id,
            ativo=True
        )
        
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        
        return TelegramConfigResponse(
            id=db_config.id,
            usuario_id=db_config.usuario_id,
            chat_id=db_config.chat_id,
            ativo=db_config.ativo,
            data_criacao=db_config.data_criacao,
            data_alteracao=db_config.data_alteracao
        )
        
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao configurar Telegram. Verifique os dados fornecidos."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get(
    path=GET_CONFIG_TELEGRAM, 
    response_model=TelegramConfigResponse, 
    tags=[Tag.Telegram.name]
)
def get_telegram_config(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    """
    Obtém a configuração atual do Telegram do usuário
    """
    config = db.query(TelegramConfig).filter(
        TelegramConfig.usuario_id == usuario_logado.id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do Telegram não encontrada"
        )
    
    return TelegramConfigResponse(
        id=config.id,
        usuario_id=config.usuario_id,
        chat_id=config.chat_id,
        ativo=config.ativo,
        data_criacao=config.data_criacao,
        data_alteracao=config.data_alteracao
    )


@router.put(
    path=UPDATE_CONFIG_TELEGRAM, 
    response_model=TelegramConfigResponse, 
    tags=[Tag.Telegram.name]
)
def update_telegram_config(
    config_update: TelegramConfigUpdate, 
    usuario_logado: Annotated[TokenData, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    """
    Atualiza a configuração do Telegram do usuário
    """
    config = db.query(TelegramConfig).filter(
        TelegramConfig.usuario_id == usuario_logado.id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do Telegram não encontrada"
        )
    
    try:
        # Atualiza os campos fornecidos
        if config_update.chat_id is not None:
            config.chat_id = config_update.chat_id
        if config_update.ativo is not None:
            config.ativo = config_update.ativo
            
        db.commit()
        db.refresh(config)
        
        return TelegramConfigResponse(
            id=config.id,
            usuario_id=config.usuario_id,
            chat_id=config.chat_id,
            ativo=config.ativo,
            data_criacao=config.data_criacao,
            data_alteracao=config.data_alteracao
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete(
    path=DELETE_CONFIG_TELEGRAM, 
    tags=[Tag.Telegram.name]
)
def delete_telegram_config(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    """
    Remove a configuração do Telegram do usuário
    """
    config = db.query(TelegramConfig).filter(
        TelegramConfig.usuario_id == usuario_logado.id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do Telegram não encontrada"
        )
    
    try:
        db.delete(config)
        db.commit()
        
        return {"message": "Configuração do Telegram removida com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post(
    path=TEST_TELEGRAM, 
    response_model=TelegramNotificationResponse, 
    tags=[Tag.Telegram.name]
)
def test_telegram_notification(
    test_message: TelegramTestMessage,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    """
    Envia uma mensagem de teste via Telegram
    """
    config = db.query(TelegramConfig).filter(
        TelegramConfig.usuario_id == usuario_logado.id,
        TelegramConfig.ativo == True
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração ativa do Telegram não encontrada"
        )
    
    try:
        # Formata mensagem de teste
        message = f"""
🧪 <b>TESTE DE NOTIFICAÇÃO</b>

<b>Mensagem:</b> {test_message.message}
<b>Data/Hora:</b> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

✅ Se você recebeu esta mensagem, a integração está funcionando corretamente!
"""
        
        # Envia mensagem de teste
        success = telegram_service.send_message(
            config.chat_id, 
            message.strip()
        )
        
        if success:
            return TelegramNotificationResponse(
                success=True,
                message="Mensagem de teste enviada com sucesso",
                sent_at=datetime.now()
            )
        else:
            return TelegramNotificationResponse(
                success=False,
                message="Falha ao enviar mensagem de teste",
                sent_at=datetime.now()
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar mensagem de teste: {str(e)}"
        )


@router.post("/config", response_model=TelegramConfigResponse)
def configurar_telegram(
    config: TelegramConfigCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Configura o Telegram para um usuário
    """
    try:
        # Verifica se já existe configuração
        existing_config = db.query(TelegramConfig).filter(
            TelegramConfig.usuario_id == current_user.id
        ).first()
        
        if existing_config:
            # Atualiza configuração existente
            existing_config.chat_id = config.chat_id
            existing_config.ativo = config.ativo
            db.commit()
            db.refresh(existing_config)
            
            logger.info(f"Configuração do Telegram atualizada para usuário {current_user.id}")
            return TelegramConfigResponse(
                id=existing_config.id,
                usuario_id=existing_config.usuario_id,
                chat_id=existing_config.chat_id,
                ativo=existing_config.ativo,
                data_criacao=existing_config.data_criacao,
                data_atualizacao=existing_config.data_atualizacao
            )
        else:
            # Cria nova configuração
            new_config = TelegramConfig(
                usuario_id=current_user.id,
                chat_id=config.chat_id,
                ativo=config.ativo
            )
            db.add(new_config)
            db.commit()
            db.refresh(new_config)
            
            logger.info(f"Nova configuração do Telegram criada para usuário {current_user.id}")
            return TelegramConfigResponse(
                id=new_config.id,
                usuario_id=new_config.usuario_id,
                chat_id=new_config.chat_id,
                ativo=new_config.ativo,
                data_criacao=new_config.data_criacao,
                data_atualizacao=new_config.data_atualizacao
            )
            
    except Exception as e:
        logger.error(f"Erro ao configurar Telegram: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/config", response_model=Optional[TelegramConfigResponse])
def obter_configuracao_telegram(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém a configuração do Telegram do usuário
    """
    try:
        config = db.query(TelegramConfig).filter(
            TelegramConfig.usuario_id == current_user.id
        ).first()
        
        if config:
            return TelegramConfigResponse(
                id=config.id,
                usuario_id=config.usuario_id,
                chat_id=config.chat_id,
                ativo=config.ativo,
                data_criacao=config.data_criacao,
                data_atualizacao=config.data_atualizacao
            )
        else:
            return None
            
    except Exception as e:
        logger.error(f"Erro ao obter configuração do Telegram: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/test")
def enviar_mensagem_teste(
    test_message: TelegramTestMessage,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envia uma mensagem de teste para o Chat ID configurado
    """
    try:
        # Busca configuração do usuário
        config = db.query(TelegramConfig).filter(
            TelegramConfig.usuario_id == current_user.id
        ).first()
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuração do Telegram não encontrada"
            )
        
        # Envia mensagem de teste
        message = f"""
🤖 <b>MENSAGEM DE TESTE</b>

Olá {current_user.name}!

Esta é uma mensagem de teste do D3 Finance.
Se você está recebendo esta mensagem, significa que sua configuração do Telegram está funcionando corretamente!

<b>Chat ID:</b> {config.chat_id}
<b>Status:</b> {'✅ Ativo' if config.ativo else '❌ Inativo'}
"""
        
        success = telegram_service.send_message(config.chat_id, message)
        
        if success:
            return {"message": "Mensagem de teste enviada com sucesso!"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao enviar mensagem de teste. Verifique se o Chat ID está correto."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem de teste: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete("/config")
def remover_configuracao_telegram(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a configuração do Telegram do usuário
    """
    try:
        config = db.query(TelegramConfig).filter(
            TelegramConfig.usuario_id == current_user.id
        ).first()
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuração do Telegram não encontrada"
            )
        
        db.delete(config)
        db.commit()
        
        logger.info(f"Configuração do Telegram removida para usuário {current_user.id}")
        return {"message": "Configuração do Telegram removida com sucesso!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao remover configuração do Telegram: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )