from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TelegramConfigCreate(BaseModel):
    chat_id: str = Field(..., description="ID do chat do Telegram")


class TelegramConfigUpdate(BaseModel):
    chat_id: Optional[str] = Field(None, description="ID do chat do Telegram")
    ativo: Optional[bool] = Field(None, description="Status da integração")


class TelegramConfigResponse(BaseModel):
    id: int
    usuario_id: int
    chat_id: str
    ativo: bool
    data_criacao: datetime
    data_alteracao: Optional[datetime] = None

    class Config:
        from_attributes = True


class TelegramTestMessage(BaseModel):
    message: str = Field(..., description="Mensagem de teste para enviar")


class TelegramNotificationResponse(BaseModel):
    success: bool
    message: str
    sent_at: datetime 