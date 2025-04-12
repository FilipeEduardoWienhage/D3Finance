from sqlalchemy import Column, Integer, String, Date
from src.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
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

