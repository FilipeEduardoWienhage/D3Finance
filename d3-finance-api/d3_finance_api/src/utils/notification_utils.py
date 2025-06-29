import logging
import threading
from typing import Optional
from sqlalchemy.orm import Session
from src.database.models import Despesas, Receitas, Contas, Transacoes
from src.services.telegram_service import telegram_service

logger = logging.getLogger(__name__)


def send_notification_sync(notification_type: str, db: Session, **kwargs):
    """
    Envia notificação de forma síncrona usando telebot
    """
    try:
        if notification_type == "despesa":
            despesa = kwargs.get("despesa")
            if despesa:
                telegram_service.notify_despesa_created(db, despesa)
                
        elif notification_type == "receita":
            receita = kwargs.get("receita")
            if receita:
                telegram_service.notify_receita_created(db, receita)
                
        elif notification_type == "conta":
            conta = kwargs.get("conta")
            if conta:
                telegram_service.notify_conta_created(db, conta)
                
        elif notification_type == "transacao":
            transacao = kwargs.get("transacao")
            if transacao:
                telegram_service.notify_transacao_created(db, transacao)
                
    except Exception as e:
        logger.error(f"Erro ao enviar notificação {notification_type}: {str(e)}")


def send_notification_background(notification_type: str, db: Session, **kwargs):
    """
    Inicia o envio de notificação em background usando threading
    """
    try:
        # Cria uma nova sessão para o background
        from src.database.database import SessionLocal
        background_db = SessionLocal()
        
        # Executa a notificação em background usando threading
        thread = threading.Thread(
            target=send_notification_sync,
            args=(notification_type, background_db),
            kwargs=kwargs,
            daemon=True
        )
        thread.start()
        
    except Exception as e:
        logger.error(f"Erro ao iniciar notificação em background: {str(e)}")


def format_currency(value: float) -> str:
    """
    Formata valor monetário no padrão brasileiro
    """
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")