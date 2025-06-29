# Bot do Telegram - D3 Finance

## 🤖 Visão Geral

O bot do Telegram para o D3 Finance é responsável por enviar notificações automáticas aos usuários quando eles realizam ações importantes no sistema, como cadastrar receitas, despesas, contas ou fazer movimentações entre contas.

## ✨ Funcionalidades

### Comandos Disponíveis

- `/start` - Informações iniciais e Chat ID
- `/chatid` - Mostra o Chat ID do usuário
- `/help` - Ajuda sobre o bot

### Notificações Automáticas

O bot envia notificações automáticas para:

1. **💰 Despesas Cadastradas**
   - Categoria, valor, descrição
   - Data de pagamento e conta utilizada

2. **💵 Receitas Cadastradas**
   - Categoria, valor, descrição
   - Data de recebimento e conta utilizada

3. **🏦 Contas Criadas**
   - Nome da conta, tipo e saldo inicial

4. **🔄 Movimentações Entre Contas**
   - Valor transferido
   - Conta origem e destino
   - Descrição da movimentação

## 🚀 Como Usar

### 1. Configuração Inicial

1. **Encontre o bot**: Procure por `@D3FinanceBot` no Telegram
2. **Inicie a conversa**: Clique em "Iniciar" ou envie `/start`
3. **Receba seu Chat ID**: O bot responderá automaticamente com seu Chat ID
4. **Configure no sistema**: Cole o Chat ID no frontend do D3 Finance

### 2. Obter Chat ID

Você pode obter seu Chat ID de duas formas:

1. **Enviar qualquer mensagem**: O bot responderá automaticamente com seu Chat ID
2. **Usar o comando `/chatid`**: Resposta específica com seu Chat ID

### 3. Configuração no Sistema

1. Acesse o sistema D3 Finance
2. Vá em "Telegram BOT" no menu
3. Cole seu Chat ID e salve
4. Pronto! Você receberá notificações automáticas

## 🔧 Configuração Técnica

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Configurações do Banco de Dados
DB_USER = root
DB_PASSWORD = 1234
DB_HOST = localhost
DB_PORT = 3306
DB_NAME = d3_finance_db

# JWT
SECRET_KEY = c554fa225b44ee8df8f824f911a8bb8bd4fbbde33b78162f04dba2ed7e3bf278

# Telegram Bot
NOTIFICATION_ENABLED = true
TELEGRAM_BOT_TOKEN = 8037320303:AAGl_n8k0OGFhu62UF27GKU3p_44pquAbLo

# Email
SMTP_SERVER = smtp.gmail.com
SMTP_PORT = 587
EMAIL_REMETENTE = d2financeproway@gmail.com
SENHA_EMAIL = nkno tivf jwnh jpki
```

### Controle de Notificações

A variável `NOTIFICATION_ENABLED` controla se o bot deve funcionar:

- `NOTIFICATION_ENABLED = true` - Bot ativo e envia notificações
- `NOTIFICATION_ENABLED = false` - Bot desabilitado (não envia notificações)

### Execução

#### Opção 1: Com a API (Recomendado)
```bash
cd d3-finance-api
python -m d3_finance_api.main
```

O bot será iniciado automaticamente junto com a API.

#### Opção 2: Independentemente
```bash
cd d3-finance-api
python bot.py
```

#### Opção 3: Teste
```bash
cd d3-finance-api
python test_bot.py
```

### Logs

Os logs do bot são salvos em:
- `bot.log` - Arquivo de log
- Console - Logs em tempo real

## 📱 Exemplos de Notificações

### Receita Cadastrada
```
💵 Receita Cadastrada!

Categoria: Salário
Valor: R$ 5.000,00
Descrição: Salário do mês
Data de Recebimento: 15/12/2024
Conta: Banco Principal

✅ Receita registrada com sucesso no sistema D3 Finance!
```

### Despesa Cadastrada
```
💰 Despesa Cadastrada!

Categoria: Alimentação
Valor: R$ 150,00
Descrição: Supermercado
Data de Pagamento: 10/12/2024
Conta: Cartão de Crédito

✅ Despesa registrada com sucesso no sistema D3 Finance!
```

### Movimentação Entre Contas
```
🔄 Movimentação Entre Contas!

Valor: R$ 1.000,00
Conta Origem: Banco Principal
Conta Destino: Poupança
Descrição: Transferência para poupança

✅ Movimentação realizada com sucesso no sistema D3 Finance!
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Bot não responde**
   - Verifique se o token está correto no `.env`
   - Confirme se `NOTIFICATION_ENABLED = true`
   - Verifique se o bot está rodando
   - Verifique os logs em `bot.log`

2. **Não recebe notificações**
   - Verifique se `NOTIFICATION_ENABLED = true`
   - Verifique se o Chat ID está correto
   - Confirme se a configuração está ativa no sistema
   - Teste enviando uma mensagem para o bot

3. **Erro "chat not found"**
   - O usuário precisa iniciar conversa com o bot primeiro
   - Use o comando `/start` para obter o Chat ID correto

4. **Bot não inicia**
   - Verifique se todas as variáveis de ambiente estão configuradas
   - Execute `python test_bot.py` para verificar a configuração

### Logs Úteis

```bash
# Verificar se o bot está rodando
tail -f bot.log

# Verificar logs da API
tail -f logs/api.log

# Testar configuração
python test_bot.py
```

### Verificação de Configuração

Execute o script de teste para verificar se tudo está configurado corretamente:

```bash
python test_bot.py
```

O script irá:
- ✅ Verificar todas as variáveis de ambiente
- ✅ Testar a conexão com o bot
- ✅ Verificar se as notificações estão habilitadas
- ✅ Testar as funções de notificação

## 🔒 Segurança

- O token do bot deve estar protegido no arquivo `.env`
- Não compartilhe o token publicamente
- O bot só responde a comandos válidos
- As notificações são enviadas apenas para usuários configurados
- Use `NOTIFICATION_ENABLED = false` para desabilitar temporariamente

## 📞 Suporte

Se encontrar problemas:

1. Execute `python test_bot.py` para diagnóstico
2. Verifique os logs do bot
3. Teste os comandos básicos (`/start`, `/chatid`)
4. Confirme se o token está correto
5. Entre em contato com o suporte técnico

## 🚀 Próximas Funcionalidades

- [ ] Notificações de saldo baixo
- [ ] Relatórios mensais via Telegram
- [ ] Configuração de horários de notificação
- [ ] Comandos para consultar saldos
- [ ] Alertas de vencimento de contas
- [ ] Configuração individual por usuário 