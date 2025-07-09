# PASSO A PASSO DETALHADO - PASSOS 2 E 3
## VALIDAÇÃO COM MESSAGESERVICE NA TELA DE CADASTRO

---

## 📋 PASSO 2: CRIAR MÉTODO DE VALIDAÇÃO GERAL

### 2.1 Estrutura do Método Principal
```typescript
public validarCampos(): boolean {
  // Limpar mensagens anteriores
  this.messageService.clear();
  
  // Validar cada step sequencialmente
  if (!this.validarStep1()) {
    return false;
  }
  
  if (!this.validarStep2()) {
    return false;
  }
  
  if (!this.validarStep3()) {
    return false;
  }
  
  return true;
}
```

### 2.2 Localização no Código
- **Arquivo:** `front-end/src/app/views/public/cadastro/cadastro.component.ts`
- **Posição:** Após o método `ngOnInit()` e antes do método `doCadastro()`
- **Visibilidade:** `public` para ser acessível pelo template

### 2.3 Integração com doCadastro()
```typescript
public doCadastro(): void {
  // VALIDAÇÃO GERAL - NOVO CÓDIGO
  if (!this.validarCampos()) {
    return; // Para execução se validação falhar
  }
  
  // VALIDAÇÃO DE SENHA - CÓDIGO EXISTENTE
  const senha = this.requestCadastro.password;
  const confirmar = this.requestCadastro.confirmarSenha;
  // ... resto do código existente
}
```

---

## 📋 PASSO 3: IMPLEMENTAR VALIDAÇÕES ESPECÍFICAS

### 3.1 VALIDAÇÃO DE EMAIL

#### 3.1.1 Regex para Email
```typescript
private validarEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

#### 3.1.2 Validação no Step 1
```typescript
// Dentro do método validarStep1()
if (!this.requestCadastro.email || this.requestCadastro.email.trim() === '') {
  this.messageService.add({
    severity: 'error',
    summary: 'Campo obrigatório',
    detail: 'O campo E-mail é obrigatório.'
  });
  return false;
}

if (!this.validarEmail(this.requestCadastro.email.trim())) {
  this.messageService.add({
    severity: 'warn',
    summary: 'Formato inválido',
    detail: 'Digite um e-mail válido (exemplo: usuario@email.com).'
  });
  return false;
}
```

### 3.2 VALIDAÇÃO DE CPF

#### 3.2.1 Verificação de Comprimento
```typescript
private validarCPF(cpf: string): boolean {
  // Remove máscara e verifica se tem 11 dígitos
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  return cpfLimpo.length === 11;
}
```

#### 3.2.2 Validação no Step 1
```typescript
// Dentro do método validarStep1()
if (!this.requestCadastro.cpf || this.requestCadastro.cpf.trim() === '') {
  this.messageService.add({
    severity: 'error',
    summary: 'Campo obrigatório',
    detail: 'O campo CPF é obrigatório.'
  });
  return false;
}

if (!this.validarCPF(this.requestCadastro.cpf)) {
  this.messageService.add({
    severity: 'warn',
    summary: 'Formato inválido',
    detail: 'Digite um CPF válido (11 dígitos).'
  });
  return false;
}
```

### 3.3 VALIDAÇÃO DE CNPJ

#### 3.3.1 Verificação de Comprimento
```typescript
private validarCNPJ(cnpj: string): boolean {
  // Remove máscara e verifica se tem 14 dígitos
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  return cnpjLimpo.length === 14;
}
```

#### 3.3.2 Validação no Step 2
```typescript
// Dentro do método validarStep2()
if (!this.requestCadastro.cnpj || this.requestCadastro.cnpj.trim() === '') {
  this.messageService.add({
    severity: 'error',
    summary: 'Campo obrigatório',
    detail: 'O campo CNPJ é obrigatório.'
  });
  return false;
}

if (!this.validarCNPJ(this.requestCadastro.cnpj)) {
  this.messageService.add({
    severity: 'warn',
    summary: 'Formato inválido',
    detail: 'Digite um CNPJ válido (14 dígitos).'
  });
  return false;
}
```

### 3.4 VALIDAÇÃO DE CEP

#### 3.4.1 Verificação de Comprimento
```typescript
private validarCEP(cep: string): boolean {
  // Remove máscara e verifica se tem 8 dígitos
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.length === 8;
}
```

#### 3.4.2 Validação no Step 2
```typescript
// Dentro do método validarStep2()
if (!this.requestCadastro.cep || this.requestCadastro.cep.trim() === '') {
  this.messageService.add({
    severity: 'error',
    summary: 'Campo obrigatório',
    detail: 'O campo CEP é obrigatório.'
  });
  return false;
}

if (!this.validarCEP(this.requestCadastro.cep)) {
  this.messageService.add({
    severity: 'warn',
    summary: 'Formato inválido',
    detail: 'Digite um CEP válido (8 dígitos).'
  });
  return false;
}
```

### 3.5 VALIDAÇÃO DE DATA

#### 3.5.1 Verificação de Data Preenchida
```typescript
private validarData(data: Date | null): boolean {
  return data !== null && data !== undefined;
}
```

#### 3.5.2 Validação no Step 1
```typescript
// Dentro do método validarStep1()
if (!this.validarData(this.requestCadastro.dataNascimento)) {
  this.messageService.add({
    severity: 'error',
    summary: 'Campo obrigatório',
    detail: 'O campo Data de Nascimento é obrigatório.'
  });
  return false;
}
```

### 3.6 VALIDAÇÃO DE SELECT (SEXO)

#### 3.6.1 Verificação de Opção Selecionada
```typescript
private validarSelect(selected: any): boolean {
  return selected !== null && selected !== undefined;
}
```

#### 3.6.2 Validação no Step 1
```typescript
// Dentro do método validarStep1()
if (!this.validarSelect(this.requestCadastro.selectedSexo)) {
  this.messageService.add({
    severity: 'error',
    summary: 'Campo obrigatório',
    detail: 'O campo Sexo é obrigatório.'
  });
  return false;
}
```

---

## 🔧 MÉTODOS AUXILIARES COMPLETOS

### Método para Validar Campos de Texto Simples
```typescript
private validarCampoTexto(valor: string, nomeCampo: string): boolean {
  if (!valor || valor.trim() === '') {
    this.messageService.add({
      severity: 'error',
      summary: 'Campo obrigatório',
      detail: `O campo ${nomeCampo} é obrigatório.`
    });
    return false;
  }
  return true;
}
```

### Método para Validar Campos com Máscara
```typescript
private validarCampoComMascara(valor: string, nomeCampo: string, digitosEsperados: number): boolean {
  if (!this.validarCampoTexto(valor, nomeCampo)) {
    return false;
  }
  
  const valorLimpo = valor.replace(/[^\d]/g, '');
  if (valorLimpo.length !== digitosEsperados) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Formato inválido',
      detail: `Digite um ${nomeCampo} válido (${digitosEsperados} dígitos).`
    });
    return false;
  }
  
  return true;
}
```

---

## 📝 EXEMPLO DE IMPLEMENTAÇÃO COMPLETA

### Método validarStep1() Completo
```typescript
private validarStep1(): boolean {
  // Nome
  if (!this.validarCampoTexto(this.requestCadastro.nome, 'Nome')) {
    return false;
  }
  
  // Email
  if (!this.validarCampoTexto(this.requestCadastro.email, 'E-mail')) {
    return false;
  }
  if (!this.validarEmail(this.requestCadastro.email.trim())) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Formato inválido',
      detail: 'Digite um e-mail válido (exemplo: usuario@email.com).'
    });
    return false;
  }
  
  // CPF
  if (!this.validarCampoComMascara(this.requestCadastro.cpf, 'CPF', 11)) {
    return false;
  }
  
  // Data de Nascimento
  if (!this.validarData(this.requestCadastro.dataNascimento)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Campo obrigatório',
      detail: 'O campo Data de Nascimento é obrigatório.'
    });
    return false;
  }
  
  // Sexo
  if (!this.validarSelect(this.requestCadastro.selectedSexo)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Campo obrigatório',
      detail: 'O campo Sexo é obrigatório.'
    });
    return false;
  }
  
  // Cargo
  if (!this.validarCampoTexto(this.requestCadastro.cargo, 'Profissão')) {
    return false;
  }
  
  return true;
}
```

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES

### 3.7 Ordem de Validação
1. **Primeiro:** Verificar se campo está vazio
2. **Segundo:** Verificar formato (se aplicável)
3. **Terceiro:** Verificar regras de negócio (se aplicável)

### 3.8 Tratamento de Espaços
- Sempre usar `.trim()` para remover espaços em branco
- Verificar se após trim() o campo não ficou vazio

### 3.9 Mensagens de Erro
- **severity: 'error'** - Para campos obrigatórios vazios
- **severity: 'warn'** - Para formatos inválidos
- **severity: 'info'** - Para orientações gerais

### 3.10 Performance
- Usar `this.messageService.clear()` no início para limpar mensagens antigas
- Retornar `false` imediatamente quando encontrar primeiro erro
- Não acumular múltiplas mensagens de erro de uma vez 