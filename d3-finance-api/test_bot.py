#!/usr/bin/env python3
"""
Script de teste para o bot do Telegram
"""

import os
import sys
from dotenv import load_dotenv

# Adiciona o diretório do projeto ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from d3_finance_api.src.services.telegram_service import telegram_service

def test_bot():
    """Testa as funcionalidades básicas do bot"""
    
    # Carrega variáveis de ambiente
    load_dotenv()
    
    # Verifica se o token está configurado
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    notification_enabled = os.getenv("NOTIFICATION_ENABLED", "false").lower() == "true"
    
    if not token:
        print("❌ TELEGRAM_BOT_TOKEN não encontrado no arquivo .env")
        print("Por favor, configure o token do bot no arquivo .env")
        return False
    
    print("✅ Token do bot encontrado")
    print(f"🔔 Notificações habilitadas: {notification_enabled}")
    
    # Testa a inicialização do bot
    try:
        print("🔄 Iniciando bot...")
        telegram_service.start_bot()
        
        if not notification_enabled:
            print("ℹ️ Bot não iniciado - notificações desabilitadas")
            return True
            
        print("✅ Bot iniciado com sucesso!")
        
        # Aguarda um pouco para o bot inicializar
        import time
        time.sleep(2)
        
        # Testa envio de mensagem (substitua pelo seu Chat ID)
        chat_id = input("Digite seu Chat ID para teste (ou pressione Enter para pular): ").strip()
        
        if chat_id:
            test_message = """
🧪 <b>Teste do Bot D3 Finance</b>

Esta é uma mensagem de teste para verificar se o bot está funcionando corretamente.

✅ Se você recebeu esta mensagem, o bot está funcionando perfeitamente!

🔧 <b>Próximos passos:</b>
1. Configure seu Chat ID no sistema D3 Finance
2. Cadastre uma receita, despesa ou conta
3. Você receberá notificações automáticas

📊 <b>Configuração atual:</b>
• Token: Configurado ✅
• Notificações: Habilitadas ✅
"""
            
            success = telegram_service.send_message(chat_id, test_message.strip())
            if success:
                print("✅ Mensagem de teste enviada com sucesso!")
            else:
                print("❌ Erro ao enviar mensagem de teste")
        
        # Para o bot
        print("🔄 Parando bot...")
        telegram_service.stop_bot()
        print("✅ Bot parado com sucesso!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar bot: {e}")
        return False

def test_notifications():
    """Testa as funções de notificação"""
    
    print("\n🧪 Testando funções de notificação...")
    
    # Verifica se as notificações estão habilitadas
    notification_enabled = os.getenv("NOTIFICATION_ENABLED", "false").lower() == "true"
    
    if not notification_enabled:
        print("ℹ️ Notificações desabilitadas - pulando testes")
        return
    
    # Teste de notificação de receita
    try:
        success = telegram_service.notify_receita_cadastrada(
            usuario_id=1,  # ID de teste
            categoria="Teste",
            valor=1000.00,
            descricao="Receita de teste",
            data_recebimento="15/12/2024",
            conta_nome="Conta Teste"
        )
        print("✅ Função de notificação de receita testada")
    except Exception as e:
        print(f"❌ Erro na função de notificação de receita: {e}")
    
    # Teste de notificação de despesa
    try:
        success = telegram_service.notify_despesa_cadastrada(
            usuario_id=1,  # ID de teste
            categoria="Teste",
            valor=500.00,
            descricao="Despesa de teste",
            data_pagamento="10/12/2024",
            conta_nome="Conta Teste"
        )
        print("✅ Função de notificação de despesa testada")
    except Exception as e:
        print(f"❌ Erro na função de notificação de despesa: {e}")
    
    # Teste de notificação de conta
    try:
        success = telegram_service.notify_conta_criada(
            usuario_id=1,  # ID de teste
            nome_conta="Conta Teste",
            tipo_conta="Corrente",
            saldo_inicial=1000.00
        )
        print("✅ Função de notificação de conta testada")
    except Exception as e:
        print(f"❌ Erro na função de notificação de conta: {e}")
    
    # Teste de notificação de movimentação
    try:
        success = telegram_service.notify_movimentacao_contas(
            usuario_id=1,  # ID de teste
            valor=500.00,
            conta_origem="Conta Origem",
            conta_destino="Conta Destino",
            descricao="Movimentação de teste"
        )
        print("✅ Função de notificação de movimentação testada")
    except Exception as e:
        print(f"❌ Erro na função de notificação de movimentação: {e}")

def check_environment():
    """Verifica as variáveis de ambiente"""
    print("🔍 Verificando variáveis de ambiente...")
    
    # Verifica variáveis obrigatórias
    required_vars = [
        "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME",
        "SECRET_KEY", "TELEGRAM_BOT_TOKEN", "NOTIFICATION_ENABLED"
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if value is None:
            missing_vars.append(var)
        else:
            # Mascara valores sensíveis
            if "PASSWORD" in var or "SECRET" in var or "TOKEN" in var:
                masked_value = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "***"
                print(f"✅ {var}: {masked_value}")
            else:
                print(f"✅ {var}: {value}")
    
    if missing_vars:
        print(f"❌ Variáveis faltando: {', '.join(missing_vars)}")
        return False
    
    print("✅ Todas as variáveis de ambiente estão configuradas!")
    return True

def main():
    """Função principal"""
    print("🤖 Teste do Bot do Telegram - D3 Finance")
    print("=" * 50)
    
    # Verifica variáveis de ambiente
    if not check_environment():
        print("\n❌ Configure as variáveis de ambiente antes de continuar")
        return
    
    print("\n" + "=" * 50)
    
    # Testa o bot
    if test_bot():
        print("\n✅ Todos os testes do bot passaram!")
    else:
        print("\n❌ Alguns testes falharam")
    
    # Testa as funções de notificação
    test_notifications()
    
    print("\n🎉 Teste concluído!")

if __name__ == "__main__":
    main() 