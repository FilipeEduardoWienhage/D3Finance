# D3 FINANCE

## Regras de Negócio (RN) - Dash Geral

### **RN01 - Exibição de Gráficos**
- **RN01.1** - O dashboard deve exibir gráficos interativos que representem dados chave de maneira visual, como gráficos de barras, linhas, pizza, etc.

### **RN02 - Filtros e Segmentação de Dados**
- **RN02.1** - O sistema deve permitir que o usuário selecione filtros para segmentar os dados exibidos nos gráficos, como período (diário, semanal, mensal, anual) ou categorias (produto, vendas, região, etc.).
- **RN02.2** - O sistema deve aplicar os filtros de forma dinâmica, atualizando os gráficos automaticamente quando um filtro for selecionado.

## Requisitos Funcionais (RF)

### **RF01 - Exibição de Gráficos Interativos**
- **RF01.1** - O sistema deve exibir gráficos dinâmicos que representam dados como vendas, receitas, lucros ou outras métricas importantes.
- **RF01.2** - O usuário deve poder interagir com os gráficos, como passar o mouse sobre elementos para visualizar detalhes ou clicar para acessar informações adicionais.

### **RF02 - Seleção de Filtros e Segmentação**
- **RF02.1** - O sistema deve fornecer filtros de dados (como por período de tempo, categoria, etc.) que o usuário possa aplicar para refinar as visualizações no dashboard.
- **RF02.2** - O sistema deve atualizar automaticamente os gráficos sempre que o usuário alterar ou aplicar novos filtros.

### **RF03 - Exibição de Mensagens de Erro**
- **RF03.1** - Caso um gráfico não consiga carregar corretamente os dados, o sistema deve exibir uma mensagem de erro, informando o usuário e oferecendo a opção de tentar novamente.

### **RF04 - Exportação de Dados**
- **RF04.1** - O sistema deve permitir que o usuário exporte os dados exibidos no dashboard (ou em gráficos específicos) para formatos como Excel ou CSV, para análise adicional ou relatórios.


## Regras de Negócio (RN) - Dash Receitas

### **RN01 - Atualização de Card de Receitas**
- **RN01** - O card de valores das receitas deve ser atualizado em tempo real conforme novas receitas forem registradas.

### **RN02 - Atualização de Listas e Gráficos**
- **RN02** - A lista detalhada de receitas, a lista de formas de recebimento e o gráfico de evolução das receitas devem ser atualizados automaticamente com novos registros de receitas.

---

## Requisitos Funcionais (RF)

### **RF01 - Exibição de Card de Valores**
- **RF01** - O sistema deverá exibir um card com os valores totais das receitas, permitindo configurações para exibir os valores de diferentes períodos (diário, mensal, anual).

### **RF02 - Exibição de Lista Detalhada de Receitas**
- **RF02** - O sistema deverá exibir uma lista detalhada de receitas com a descrição, quantidade, valor total e porcentagem em relação ao montante total das receitas, permitindo filtros por período e categorias, além de ordenar os itens por valor, quantidade ou porcentagem.

### **RF03 - Exibição de Lista de Formas de Recebimento**
- **RF03** - O sistema deverá exibir uma lista detalhada das formas de recebimento das receitas, com informações sobre a forma de pagamento (dinheiro, Pix, cartão de débito/crédito), quantidade de vezes recebida dessa forma, valor total e porcentagem, permitindo filtros por período e por tipo de forma de pagamento.


## Regras de Negócio (RN) - Dash Despesas

### **RN01 - Atualização de Valor das Despesas**
- **RN01** - O valor das despesas deve ser atualizado em tempo real à medida que novas despesas forem registradas.

### **RN02 - Atualização de Lista de Despesas**
- **RN02** - A lista detalhada de despesas deve ser atualizada automaticamente com novos registros de despesas.

---

## Requisitos Funcionais (RF)

### **RF01 - Card de Valores Totais das Despesas**
- **RF01** - O sistema deverá exibir um card com os valores totais das despesas, atualizado em tempo real, e permitindo a exibição de valores para diferentes períodos (diário, mensal, anual).

### **RF02 - Lista Detalhada de Despesas**
- **RF02** - O sistema deverá exibir uma lista detalhada das despesas, incluindo descrição, quantidade, valor total e porcentagem em relação ao montante total, com a capacidade de filtrar por período (dia, mês, ano) e categorias de despesa, além de permitir a ordenação por valor, quantidade ou porcentagem.

### **RF03 - Gráfico de Evolução das Despesas**
- **RF03** - O sistema deverá exibir um gráfico de evolução das despesas ao longo do tempo, permitindo a filtragem por ano, mês e dia, e possibilitando a comparação de diferentes períodos para análise de tendências.


## Regras de Negócio (RN) - Login

### **RN01 - Recuperação de Senha e Cadastro**
- **RN01** - O usuário deve ter a opção de recuperar sua senha em caso de esquecimento e fazer um cadastro novo caso não possuir.

---

## Requisitos Funcionais (RF)

### **RF01 - Formulário de Login**
- **RF01** - O sistema deverá fornecer um formulário de login com campos para e-mail ou ID, senha e um link para redirecionar ao cadastro.


## Regras de Negócio (RN) - Cadastro usuário

### **RN01 - Validação de Campos Obrigatórios**
- **RN01.1** - Todos os campos obrigatórios (como nome, e-mail, cargo e senha) devem ser preenchidos para avançar para a próxima etapa do cadastro.
- **RN01.2** - Caso um campo obrigatório não seja preenchido, o sistema deve exibir uma mensagem de erro informando o campo faltante.

### **RN02 - Validação de E-mail**
- **RN02.1** - O sistema deve verificar se o e-mail informado já está cadastrado no sistema. Caso o e-mail já exista, o sistema deve exibir uma mensagem de erro, impedindo a duplicação de e-mails.

### **RN03 - Validação de Senha**
- **RN03.1** - A senha do usuário deve atender aos critérios de segurança, como: mínimo de 8 caracteres, incluindo pelo menos uma letra maiúscula, um número e um caractere especial.
- **RN03.2** - Caso a senha não atenda aos critérios, o sistema deve exibir uma mensagem informando os requisitos necessários.

### **RN04 - Navegação Condicional**
- **RN04.1** - O botão "Próxima Etapa" só deve ser habilitado quando todos os campos obrigatórios forem preenchidos corretamente.
- **RN04.2** - O botão "Voltar" deve sempre levar o usuário à etapa anterior sem perder as informações já preenchidas.

### **RF01 - Formulário de Cadastro de Usuário**
- **RF01** - O sistema deverá fornecer um formulário de cadastro de usuário com os seguintes campos:
  - Nome completo
  - E-mail
  - CPF
  - Senha
  - Confirmação de senha
  - Gênero
  - Profissão
  - Um botão para prosseguir para a próxima etapa do cadastro.


## Regras de Negócio (RN) - Cadastro empresa

### **RN01 - Validação de Campos Obrigatórios**
- **RN01.1** - Todos os campos obrigatórios (como nome da empresa, CNPJ, e-mail, nome do usuário e senha) devem ser preenchidos para avançar para a próxima etapa do cadastro.
- **RN01.2** - Caso um campo obrigatório não seja preenchido, o sistema deve exibir uma mensagem de erro informando o campo faltante.

### **RN02 - Preenchimento Automático da Razão Social**
- **RN02.1** - O sistema deve integrar com uma API de consulta de CNPJ (por exemplo, API da Receita Federal ou de terceiros) para preencher automaticamente o campo de razão social da empresa, assim que o CNPJ for informado.
- **RN02.2** - Caso a API não consiga retornar a razão social corretamente, o sistema deve permitir que o usuário preencha o campo manualmente, com a opção de validar os dados posteriormente, e com um aviso de que o preenchimento automático falhou.

### **RN03 - Preenchimento Automático do Endereço com VIA CEP**
- **RN03.1** - O sistema deve integrar com a API "VIA CEP" para preencher automaticamente os campos de endereço, como logradouro, bairro, cidade, estado e CEP, a partir do CEP informado pelo usuário.
- **RN03.2** - Se a API não conseguir retornar as informações corretamente, o sistema deve permitir que o usuário complete ou corrija os dados manualmente, com um aviso de que o preenchimento automático falhou.

### **RN04 - Navegação Condicional**
- **RN04.1** - O botão "Próxima Etapa" só deve ser habilitado quando todos os campos obrigatórios forem preenchidos corretamente.
- **RN04.2** - O botão "Voltar" deve sempre levar o usuário à etapa anterior sem perder as informações já preenchidas.

---

## Requisitos Funcionais (RF)

### **RF01 - Cadastro da Empresa**
- **RF01.1** - O sistema deve permitir o cadastro da empresa, incluindo informações como nome da empresa, CNPJ, endereço, telefone, e-mail e segmento de atuação.

### **RF02 - Alteração Manual de Dados Preenchidos Automaticamente**
- **RF02.1** - O sistema permitirá que o usuário altere manualmente os dados preenchidos automaticamente (como razão social e endereço) caso o processo de preenchimento automático não seja bem-sucedido. Isso garantirá que o usuário tenha a possibilidade de corrigir informações de forma rápida e fácil.

### **RF03 - Navegação para Etapa Anterior**
- **RF03.1** - O sistema disponibilizará um botão que permitirá ao usuário retornar à etapa anterior do cadastro, caso precise revisar ou corrigir informações inseridas anteriormente. O sistema deve manter os dados preenchidos nas etapas anteriores ao voltar para a etapa anterior.

### **RF04 - Navegação para Próxima Etapa**
- **RF04.1** - O sistema disponibilizará um botão que permitirá ao usuário avançar para a próxima etapa do cadastro, após a conclusão de todas as informações obrigatórias na etapa atual. O botão "Próxima Etapa" só será habilitado quando todos os campos obrigatórios forem preenchidos corretamente.


## Requisitos Funcionais (RF) - Contato

### RF01 - Contato
- **RF01.1** - O sistema deverá exibir 3 cards, cada um contendo:
  - Uma imagem da pessoa envolvida no trabalho.
  - Um breve resumo sobre a pessoa.
  - Links com suas mídias sociais pessoais (Instagram, GitHub, LinkedIn).


# Requisitos Não Funcionais


## **Usabilidade**
- O sistema deve ter uma interface amigável e intuitiva, com navegação simples e clara.

## **Segurança**
- O sistema deve garantir a proteção dos dados sensíveis dos comerciantes, como informações financeiras e dados de clientes.
- O sistema deve implementar criptografia em comunicações e armazenar as senhas de forma segura (por exemplo, utilizando hash).

## **Manutenibilidade**
- O sistema deve ser fácil de manter e atualizar.
- Deve ser possível realizar atualizações sem causar interrupções significativas no serviço.
