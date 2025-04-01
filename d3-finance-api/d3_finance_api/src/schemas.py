from typing import Optional
from pydantic.dataclasses import dataclass


# Classe base para os dados do usuário, usada como estrutura comum para criação e resposta de usuários
@dataclass
class UserBase:
    name: str  # Nome do usuário, obrigatório
    email: str  # Email do usuário, obrigatório


# Classe usada para criar um novo usuário. Herda de UserBase e pode ser expandida se necessário no futuro.
@dataclass
class UserCreate(UserBase):
    pass  # A classe herda todos os campos de UserBase sem adicionar novos ou modificar os existentes


# Classe usada para atualizar um usuário existente. O nome e o email são opcionais, permitindo que um ou
# ambos os campos possam ser atualizados.
@dataclass
class UserUpdate:
    name: Optional[str] = None  # Nome do usuário a ser atualizado, opcional
    email: Optional[str] = None  # Email do usuário a ser atualizado, opcional


# Classe usada para retornar os dados do usuário na resposta da API, incluindo o ID gerado pelo banco de dados.
@dataclass
class UserResponse(UserBase):
    id: int  # ID único do usuário, obrigatório, que será retornado na resposta
