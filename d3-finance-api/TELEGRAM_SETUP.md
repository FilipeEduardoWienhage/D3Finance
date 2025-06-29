# Configuração do Bot do Telegram - D3 Finance

## 📋 Pré-requisitos

1. Bot do Telegram já criado
2. Token do bot configurado no arquivo `.env`
3. Backend rodando e acessível via HTTPS

## 🔧 Configuração do Webhook

### 1. Configurar o Webhook

Para que o bot responda automaticamente, você precisa configurar o webhook. Execute o seguinte comando substituindo os valores:

```bash
curl -X POST "https://api.telegram.org/bot8037320303:AAGl_n8k0OGFhu62UF27GKU3p_44pquAbLo/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://127.0.0.1:8000/v1/telegram/webhook",
    "allowed_updates": ["message"]
  }'
```

### 2. Verificar se o Webhook está configurado

```bash
curl "https://api.telegram.org/bot8037320303:AAGl_n8k0OGFhu62UF27GKU3p_44pquAbLo/getWebhookInfo"
```

### 3. Remover Webhook (se necessário)

```bash
curl -X POST "https://api.telegram.org/bot8037320303:AAGl_n8k0OGFhu62UF27GKU3p_44pquAbLo/deleteWebhook"
```

## 🤖 Funcionalidades do Bot

### Comandos Disponíveis

- `/start` - Informações iniciais e Chat ID
- `/chatid` - Mostra o Chat ID do usuário
- `/help` - Ajuda sobre o bot

### Respostas Automáticas

O bot responde automaticamente a qualquer mensagem com:
- Chat ID do usuário
- Instruções de como configurar no sistema
- Lista de notificações disponíveis

## 📱 Processo para o Usuário

1. **Encontrar o bot**: @D3FinanceBot
2. **Iniciar conversa**: Clicar em "Iniciar" ou enviar `/start`
3. **Enviar mensagem**: Qualquer mensagem (ex: "Olá")
4. **Receber Chat ID**: Bot responde automaticamente
5. **Configurar no sistema**: Colar Chat ID no frontend

## 🔒 Segurança

- O webhook deve ser configurado apenas em HTTPS
- O token do bot deve estar protegido no `.env`
- O endpoint não requer autenticação (padrão do Telegram)

## 🚀 Deploy

### Variáveis de Ambiente Necessárias

```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

### URL do Webhook

A URL do webhook deve ser:
```
https://seu-dominio.com/v1/telegram/webhook
```

## 📊 Monitoramento

### Logs do Webhook

O endpoint `/v1/telegram/webhook` retorna:
- `{"ok": true}` - Sucesso
- `{"ok": false, "result": {"error": "mensagem"}}` - Erro

### Teste do Bot

1. Envie uma mensagem para o bot
2. Verifique se recebeu resposta automática
3. Teste os comandos `/start`, `/chatid`, `/help`

## 🔧 Troubleshooting

### Problemas Comuns

1. **Webhook não configurado**
   - Execute o comando setWebhook
   - Verifique se a URL está correta

2. **Bot não responde**
   - Verifique se o token está correto
   - Confirme se o backend está rodando
   - Verifique os logs do servidor

3. **Erro de HTTPS**
   - Webhook só funciona com HTTPS
   - Use um proxy reverso se necessário

4. **"chat not found" Error**
   - O usuário precisa iniciar conversa com o bot primeiro
   - Verifique se o Chat ID está correto
   - Teste com um Chat ID válido

### Como Resolver "chat not found"

#### 1. Verificar se o Bot está Funcionando

```bash
# Teste básico do bot
curl "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/getMe"
```

#### 2. Obter Chat ID Válido

O usuário DEVE:
1. Encontrar o bot no Telegram
2. Clicar em "Iniciar" ou enviar `/start`
3. Enviar qualquer mensagem
4. O webhook responderá automaticamente

#### 3. Testar com Chat ID Correto

```bash
# Primeiro, obtenha um Chat ID válido através do webhook
# Depois teste com esse Chat ID:

curl -X POST "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "CHAT_ID_VALIDO", "text": "Teste"}'
```

#### 4. Verificar Webhook

```bash
# Verificar se o webhook está funcionando
curl "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/getWebhookInfo"
```

### Logs Úteis

```bash
# Verificar webhook atual
curl "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/getWebhookInfo"

# Testar envio de mensagem
curl -X POST "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "CHAT_ID", "text": "Teste"}'
```

## 🚨 Passos para Resolver o Erro

### 1. Verificar Bot
```bash
curl "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/getMe"
```

### 2. Configurar Webhook
```bash
curl -X POST "https://api.telegram.org/bot8037320303:AAHxdYYKGrzWq9n84nBWNuAiwviqT516g2c/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://seu-dominio.com/v1/telegram/webhook"}'
```

### 3. Testar Webhook
- Envie uma mensagem para o bot
- Verifique se recebeu resposta
- O Chat ID será fornecido automaticamente

### 4. Usar Chat ID Correto
- Use apenas Chat IDs obtidos através do webhook
- Não tente adivinhar ou usar IDs de outros bots 
