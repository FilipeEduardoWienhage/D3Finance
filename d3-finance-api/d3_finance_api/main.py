import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from src.app import app
from src.database.database import engine, Base
from src.api.v1.endpoints import usuario_controller,telegram_controller, receita_controller, despesa_controller, contas_controller, importacao_controller, transacoes_controller, autenticacao_controller, recuperacao_controller, contas_receber_controller, contas_pagar_controller, relatorios_controller, stripe_controller, orcado_realizado_controller, orcado_realizado_despesas_controller, assistente_controller
from src.services.telegram_service import telegram_service
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Inclui o controlador de usuários na aplicação. Isso registra as rotas definidas no `user_controller`.
app.include_router(usuario_controller.router)
app.include_router(receita_controller.router)
app.include_router(despesa_controller.router)
app.include_router(contas_controller.router)
app.include_router(importacao_controller.router)
app.include_router(transacoes_controller.router)
app.include_router(autenticacao_controller.router)
app.include_router(recuperacao_controller.router)
app.include_router(telegram_controller.router)
app.include_router(contas_receber_controller.router)
app.include_router(contas_pagar_controller.router)
app.include_router(relatorios_controller.router)
app.include_router(orcado_realizado_controller.router)
app.include_router(orcado_realizado_despesas_controller.router)
app.include_router(stripe_controller.router)
app.include_router(assistente_controller.router)


# Inicializa o bot do Telegram
@app.on_event("startup")
async def startup_event():
    """Evento executado quando a aplicação inicia"""
    try:
        logger.info("Iniciando bot do Telegram...")
        telegram_service.start_bot()
        logger.info("Bot do Telegram iniciado com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao iniciar bot do Telegram: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento executado quando a aplicação é finalizada"""
    try:
        logger.info("Parando bot do Telegram...")
        telegram_service.stop_bot()
        logger.info("Bot do Telegram parado com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao parar bot do Telegram: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app")
