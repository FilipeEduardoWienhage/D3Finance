import logging
import os
import threading
from dotenv import load_dotenv
import telebot
from telebot.types import Message
from sqlalchemy.orm import Session
from src.database.database import SessionLocal
from src.database.models import TelegramConfig, Usuario

logger = logging.getLogger(__name__)

load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
NOTIFICATION_ENABLED = os.getenv("NOTIFICATION_ENABLED", "false").lower() == "true"

if not TELEGRAM_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN não encontrado no arquivo .env")
    bot = None
else:
    bot = telebot.TeleBot(TELEGRAM_TOKEN)

class TelegramService:
    def __init__(self):
        self.bot = bot
        self.is_running = False
        self.bot_thread = None
        self.notification_enabled = NOTIFICATION_ENABLED
        
    def start_bot(self):
        """Inicia o bot em uma thread separada"""
        if self.is_running:
            logger.info("Bot já está rodando")
            return
            
        if not self.bot:
            logger.error("Bot não pode ser iniciado - token não configurado")
            return
            
        if not self.notification_enabled:
            logger.info("Notificações do Telegram estão desabilitadas")
            return
            
        self.is_running = True
        self.bot_thread = threading.Thread(target=self._run_bot, daemon=True)
        self.bot_thread.start()
        logger.info("Bot do Telegram iniciado com sucesso")
        
    def stop_bot(self):
        """Para o bot"""
        self.is_running = False
        if self.bot:
            self.bot.stop_polling()
        logger.info("Bot do Telegram parado")
        
    def _run_bot(self):
        """Executa o bot com polling"""
        try:
            logger.info("Iniciando polling do bot...")
            self.bot.polling(none_stop=True, timeout=60)
        except Exception as e:
            logger.error(f"Erro no polling do bot: {e}")
            self.is_running = False
            
    def send_message(self, chat_id: str, message: str, parse_mode: str = "HTML") -> bool:
        """Envia mensagem para um chat específico"""
        try:
            if not self.bot:
                logger.error("Bot não inicializado")
                return False
                
            if not self.notification_enabled:
                logger.info("Notificações do Telegram estão desabilitadas")
                return False
                
            self.bot.send_message(chat_id, message, parse_mode=parse_mode)
            logger.info(f"Mensagem enviada para chat_id: {chat_id}")
            return True
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem para {chat_id}: {e}")
            return False
            
    def send_message_with_keyboard(self, chat_id: str, message: str, keyboard: dict, parse_mode: str = "HTML") -> bool:
        """Envia mensagem com teclado inline para um chat específico"""
        try:
            if not self.bot:
                logger.error("Bot não inicializado")
                return False
                
            if not self.notification_enabled:
                logger.info("Notificações do Telegram estão desabilitadas")
                return False
                
            from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
            
            # Converte o dicionário de teclado para InlineKeyboardMarkup
            markup = InlineKeyboardMarkup()
            for row in keyboard.get("inline_keyboard", []):
                keyboard_row = []
                for button in row:
                    keyboard_row.append(InlineKeyboardButton(
                        text=button["text"], 
                        callback_data=button["callback_data"]
                    ))
                markup.add(*keyboard_row)
            
            self.bot.send_message(chat_id, message, parse_mode=parse_mode, reply_markup=markup)
            logger.info(f"Mensagem com teclado enviada para chat_id: {chat_id}")
            return True
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem com teclado para {chat_id}: {e}")
            return False
            
    def send_notification_to_user(self, usuario_id: int, message: str, parse_mode: str = "HTML") -> bool:
        """Envia notificação para um usuário específico"""
        try:
            if not self.notification_enabled:
                logger.info("Notificações do Telegram estão desabilitadas")
                return False
                
            db = SessionLocal()
            config = db.query(TelegramConfig).filter(
                TelegramConfig.usuario_id == usuario_id,
                TelegramConfig.ativo == True
            ).first()
            
            if not config:
                logger.info(f"Usuário {usuario_id} não tem configuração do Telegram ativa")
                return False
                
            return self.send_message(config.chat_id, message, parse_mode)
        except Exception as e:
            logger.error(f"Erro ao enviar notificação para usuário {usuario_id}: {e}")
            return False
        finally:
            db.close()

    def notify_receita_cadastrada(self, usuario_id: int, categoria: str, valor: float, descricao: str, data_recebimento: str, conta_nome: str) -> bool:
        """Notifica quando uma receita é cadastrada"""
        if not self.notification_enabled:
            logger.info("Notificações do Telegram estão desabilitadas")
            return False
            
        message = f"""
💵 <b>Receita Cadastrada!</b>

<b>Categoria:</b> {categoria}
<b>Valor:</b> R$ {valor:,.2f}
<b>Descrição:</b> {descricao}
<b>Data de Recebimento:</b> {data_recebimento}
<b>Conta:</b> {conta_nome}

✅ Receita registrada com sucesso no sistema D3 Finance!
"""
        return self.send_notification_to_user(usuario_id, message.strip())

    def notify_despesa_cadastrada(self, usuario_id: int, categoria: str, valor: float, descricao: str, data_pagamento: str, conta_nome: str) -> bool:
        """Notifica quando uma despesa é cadastrada"""
        if not self.notification_enabled:
            logger.info("Notificações do Telegram estão desabilitadas")
            return False
            
        message = f"""
💰 <b>Despesa Cadastrada!</b>

<b>Categoria:</b> {categoria}
<b>Valor:</b> R$ {valor:,.2f}
<b>Descrição:</b> {descricao}
<b>Data de Pagamento:</b> {data_pagamento}
<b>Conta:</b> {conta_nome}

✅ Despesa registrada com sucesso no sistema D3 Finance!
"""
        return self.send_notification_to_user(usuario_id, message.strip())

    def notify_conta_criada(self, usuario_id: int, nome_conta: str, tipo_conta: str, saldo_inicial: float) -> bool:
        """Notifica quando uma conta é criada"""
        if not self.notification_enabled:
            logger.info("Notificações do Telegram estão desabilitadas")
            return False
            
        message = f"""
🏦 <b>Conta Criada!</b>

<b>Nome da Conta:</b> {nome_conta}
<b>Tipo:</b> {tipo_conta}
<b>Saldo Inicial:</b> R$ {saldo_inicial:,.2f}

✅ Conta criada com sucesso no sistema D3 Finance!
"""
        return self.send_notification_to_user(usuario_id, message.strip())

    def notify_movimentacao_contas(self, usuario_id: int, valor: float, conta_origem: str, conta_destino: str, descricao: str) -> bool:
        """Notifica quando há movimentação entre contas"""
        if not self.notification_enabled:
            logger.info("Notificações do Telegram estão desabilitadas")
            return False
            
        message = f"""
🔄 <b>Movimentação Entre Contas!</b>

<b>Valor:</b> R$ {valor:,.2f}
<b>Conta Origem:</b> {conta_origem}
<b>Conta Destino:</b> {conta_destino}
<b>Descrição:</b> {descricao}

✅ Movimentação realizada com sucesso no sistema D3 Finance!
"""
        return self.send_notification_to_user(usuario_id, message.strip())

# Instância global do serviço
telegram_service = TelegramService()

# Handlers do bot
@bot.message_handler(commands=['start'])
def start_command(message: Message):
    """Handler para o comando /start"""
    chat_id = message.chat.id
    user_name = message.from_user.first_name or "Usuário"
    
    welcome_message = f"""
🤖 <b>D3 Finance - Bot de Notificações</b>

Olá, <b>{user_name}</b>! 👋

<b>Seu Chat ID:</b> <code>{chat_id}</code>

📋 <b>Como configurar:</b>
1. Copie o Chat ID acima
2. Acesse o sistema D3 Finance
3. Vá em "Telegram BOT" no menu
4. Cole o Chat ID e salve

✅ <b>Notificações que você receberá:</b>
• 💰 Despesas registradas
• 💵 Receitas registradas  
• 🏦 Contas criadas
• 🔄 Movimentações entre contas

🔧 <b>Comandos disponíveis:</b>
/start - Mostra esta mensagem
/chatid - Mostra seu Chat ID
/help - Ajuda sobre o bot
"""
    
    try:
        bot.reply_to(message, welcome_message.strip(), parse_mode="HTML")
        logger.info(f"Comando /start executado para chat_id: {chat_id}")
    except Exception as e:
        logger.error(f"Erro ao responder comando /start: {e}")

@bot.message_handler(commands=['chatid'])
def chatid_command(message: Message):
    """Handler para o comando /chatid"""
    chat_id = message.chat.id
    
    chatid_message = f"""
📱 <b>Seu Chat ID</b>

<b>Chat ID:</b> <code>{chat_id}</code>

💡 <b>Dica:</b> Use este ID para configurar as notificações no sistema D3 Finance.
"""
    
    try:
        bot.reply_to(message, chatid_message.strip(), parse_mode="HTML")
        logger.info(f"Comando /chatid executado para chat_id: {chat_id}")
    except Exception as e:
        logger.error(f"Erro ao responder comando /chatid: {e}")

@bot.message_handler(commands=['help'])
def help_command(message: Message):
    """Handler para o comando /help"""
    chat_id = message.chat.id
    
    help_message = f"""
📚 <b>Ajuda - D3 Finance Bot</b>

Este bot é responsável por enviar notificações automáticas do sistema D3 Finance.

<b>Comandos:</b>
/start - Informações iniciais e Chat ID
/chatid - Mostra seu Chat ID
/help - Esta mensagem de ajuda

<b>Notificações que você receberá:</b>
• 💰 Despesas registradas
• 💵 Receitas registradas
• 🏦 Contas criadas
• 🔄 Movimentações entre contas

<b>Seu Chat ID atual:</b> <code>{chat_id}</code>

❓ <b>Precisa de ajuda?</b>
Entre em contato com o suporte do D3 Finance.
"""
    
    try:
        bot.reply_to(message, help_message.strip(), parse_mode="HTML")
        logger.info(f"Comando /help executado para chat_id: {chat_id}")
    except Exception as e:
        logger.error(f"Erro ao responder comando /help: {e}")

@bot.message_handler(func=lambda message: True)
def handle_all_messages(message: Message):
    """Handler para todas as outras mensagens"""
    chat_id = message.chat.id
    user_name = message.from_user.first_name or "Usuário"
    
    response_message = f"""
👋 <b>Olá, {user_name}!</b>

<b>Seu Chat ID é:</b> <code>{chat_id}</code>

💡 <b>Dica:</b> Use /start para mais informações ou /help para ajuda.

🔧 <b>Comandos disponíveis:</b>
/start - Informações iniciais
/chatid - Mostra seu Chat ID
/help - Ajuda sobre o bot
"""
    
    try:
        bot.reply_to(message, response_message.strip(), parse_mode="HTML")
        logger.info(f"Mensagem respondida para chat_id: {chat_id}")
    except Exception as e:
        logger.error(f"Erro ao responder mensagem: {e}")

def iniciar_telebot():
    """Função para iniciar o bot (mantida para compatibilidade)"""
    if telegram_service:
        telegram_service.start_bot()
    else:
        logger.error("Telegram service não disponível")

