from sqlalchemy import Column, Integer, String, Date
from src.database import Base


# Classe User representa a tabela 'users' no banco de dados. Herda de 'Base', que é a classe base para todas as tabelas.
class Usuario(Base):
    __tablename__ = "usuarios"  # Define o nome da tabela no banco de dados como 'users'

    # Define a coluna 'id', que é do tipo Integer, é a chave primária da tabela e terá índice
    id = Column(
        Integer, primary_key=True, index=True
    )  # A coluna 'id' é única para cada usuário e serve como chave primária

    # Define a coluna 'name', que é do tipo String com comprimento máximo de 50 caracteres.
    # Esta coluna não pode ser nula (obrigatória).
    name = Column(String(50), nullable=False)  # O nome do usuário é uma string de até 50 caracteres e não pode ser nulo

    # Define a coluna 'email', que é do tipo String com comprimento máximo de 100 caracteres.
    # O email deve ser único e terá um índice para consultas mais rápidas.
    # Esta coluna também não pode ser nula (obrigatória).
    email = Column(String(100), unique=True, index=True, nullable=False)  # O email é único, indexado e obrigatório

    cpf = Column(String(11), unique=True, index=True, nullable=False)

    data_nascimento = Column(Date, nullable=False)
                             
    sexo = Column(String(20), nullable=False)

    profissao = Column(String(45), nullable=False)

    cnpj = Column(String(14), nullable=False)

    razao_social = Column(String(55), nullable=False)

    cep = Column(String(8), nullable=False)

    estado = Column(String(2), nullable=False)

    cidade = Column(String(30), nullable=False)

    bairro = Column(String(30), nullable=False)

    senha = Column(String(30), nullable=False)

