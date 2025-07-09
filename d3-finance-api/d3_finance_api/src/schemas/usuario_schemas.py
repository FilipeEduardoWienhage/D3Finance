from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, validator, EmailStr
import re


# Base comum para criação e resposta de usuários
class UsuarioBase(BaseModel):
    name: str
    email: EmailStr
    cpf: str
    data_nascimento: date
    sexo: str
    profissao: str
    cnpj: str
    razao_social: str
    cep: str
    estado: str
    cidade: str
    bairro: str
    usuario: str

    @validator('name')
    def validar_nome(cls, v):
        if not v or not v.strip():
            raise ValueError('Nome não pode ser vazio')
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()

    @validator('cpf')
    def validar_cpf(cls, v):
        # Remover formatação
        cpf_limpo = re.sub(r'[^\d]', '', v)
        if len(cpf_limpo) != 11:
            raise ValueError('CPF deve conter 11 dígitos')
        if not cpf_limpo.isdigit():
            raise ValueError('CPF deve conter apenas números')
        return cpf_limpo

    @validator('cnpj')
    def validar_cnpj(cls, v):
        # Remover formatação
        cnpj_limpo = re.sub(r'[^\d]', '', v)
        if len(cnpj_limpo) != 14:
            raise ValueError('CNPJ deve conter 14 dígitos')
        if not cnpj_limpo.isdigit():
            raise ValueError('CNPJ deve conter apenas números')
        return cnpj_limpo

    @validator('cep')
    def validar_cep(cls, v):
        # Remover formatação
        cep_limpo = re.sub(r'[^\d]', '', v)
        if len(cep_limpo) != 8:
            raise ValueError('CEP deve conter 8 dígitos')
        if not cep_limpo.isdigit():
            raise ValueError('CEP deve conter apenas números')
        return cep_limpo

    @validator('data_nascimento')
    def validar_data_nascimento(cls, v):
        if v > date.today():
            raise ValueError('Data de nascimento não pode ser futura')
        if v < date(1900, 1, 1):
            raise ValueError('Data de nascimento inválida')
        return v

    @validator('sexo')
    def validar_sexo(cls, v):
        sexos_validos = ['Masculino', 'Feminino', 'Outro']
        if v not in sexos_validos:
            raise ValueError('Sexo deve ser Masculino, Feminino ou Outro')
        return v

    @validator('estado')
    def validar_estado(cls, v):
        if not v or not v.strip():
            raise ValueError('Estado não pode ser vazio')
        if len(v.strip()) != 2:
            raise ValueError('Estado deve ter 2 caracteres (UF)')
        return v.strip().upper()

    @validator('cidade')
    def validar_cidade(cls, v):
        if not v or not v.strip():
            raise ValueError('Cidade não pode ser vazia')
        return v.strip()

    @validator('bairro')
    def validar_bairro(cls, v):
        if not v or not v.strip():
            raise ValueError('Bairro não pode ser vazio')
        return v.strip()

    @validator('profissao')
    def validar_profissao(cls, v):
        if not v or not v.strip():
            raise ValueError('Profissão não pode ser vazia')
        return v.strip()

    @validator('razao_social')
    def validar_razao_social(cls, v):
        if not v or not v.strip():
            raise ValueError('Razão social não pode ser vazia')
        return v.strip()

    @validator('usuario')
    def validar_usuario(cls, v):
        if not v or not v.strip():
            raise ValueError('Usuário não pode ser vazio')
        if len(v.strip()) < 3:
            raise ValueError('Usuário deve ter pelo menos 3 caracteres')
        return v.strip()


# Para criação de usuário, adiciona o campo de senha
class UsuarioCreate(UsuarioBase):
    senha: str

    @validator('senha')
    def validar_senha(cls, v):
        if len(v) < 8:
            raise ValueError('Senha deve ter pelo menos 8 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')
        if not re.search(r'\d', v):
            raise ValueError('Senha deve conter pelo menos um número')
        return v


# Para atualização, todos os campos são opcionais
class UsuarioUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cpf: Optional[str] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    profissao: Optional[str] = None
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    cep: Optional[str] = None
    estado: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    usuario: Optional[str] = None
    senha: Optional[str] = None


# Para resposta da API, inclui o ID
class UsuarioResponse(UsuarioBase):
    id: int
    data_criacao: Optional[datetime] = None
    data_alteracao: Optional[datetime] = None