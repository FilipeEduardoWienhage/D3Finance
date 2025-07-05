import os
import sys
import signal
import logging
from dotenv import load_dotenv

# Adiciona o diretório do projeto ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from d3_finance_api.src.services.telegram_service import telegram_service, iniciar_telebot

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def signal_handler(signum, frame):
    """Handler para sinais de interrupção"""
    logger.info("Recebido sinal de interrupção. Parando o bot...")
    if telegram_service:
        telegram_service.stop_bot()
    sys.exit(0)

def main():
    """Função principal"""
    # Carrega variáveis de ambiente
    load_dotenv()
    
    # Verifica se o token está configurado
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN não encontrado no arquivo .env")
        logger.error("Por favor, configure o token do bot no arquivo .env")
        sys.exit(1)
    
    # Configura handlers de sinal
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("Iniciando bot do Telegram para D3 Finance...")
    logger.info("Pressione Ctrl+C para parar o bot")
    
    try:
        # Inicia o bot
        iniciar_telebot()
        
        # Mantém o programa rodando
        while True:
            signal.pause()
            
    except KeyboardInterrupt:
        logger.info("Bot interrompido pelo usuário")
    except Exception as e:
        logger.error(f"Erro inesperado: {e}")
    finally:
        if telegram_service:
            telegram_service.stop_bot()
        logger.info("Bot finalizado")

if __name__ == "__main__":
    main() 