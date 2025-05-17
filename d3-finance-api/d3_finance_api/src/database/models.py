from sqlalchemy import Column, DateTime, Integer, String, Date, ForeignKey, Float, func
from src.database.database import Base
from sqlalchemy.orm import relationship


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    cpf = Column(String(14), unique=True, index=True, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    sexo = Column(String(20), nullable=False)
    profissao = Column(String(45), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False)
    razao_social = Column(String(55), nullable=False)
    cep = Column(String(14), nullable=False)
    estado = Column(String(2), nullable=False)
    cidade = Column(String(30), nullable=False)
    bairro = Column(String(30), nullable=False)
    usuario = Column(String(30), unique=True, nullable=False)
    senha = Column(String(250), nullable=False)


class Receitas(Base):
    __tablename__ = "receitas"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String(50), nullable=False)
    valor_recebido = Column(Float, nullable=False)
    data_recebimento = Column(Date, nullable=False)
    descricao = Column(String(250))
    forma_recebimento = Column(String(50), nullable=False)
    conta_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    conta = relationship("Contas", back_populates="receitas", foreign_keys=[conta_id])


class Despesas(Base):
    __tablename__ = "despesas"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String(50), nullable=False)
    valor_pago = Column(Float, nullable=False)
    data_pagamento = Column(Date, nullable=False)
    descricao = Column(String(250))
    forma_pagamento = Column(String(50), nullable=False)
    conta_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    conta = relationship("Contas", back_populates="despesas", foreign_keys=[conta_id])


class Contas(Base):
    __tablename__ = "contas"

    id = Column(Integer, primary_key=True, index=True)
    tipo_conta = Column(String(50), nullable=False)
    nome_conta = Column(String(50), unique=True, nullable=False)
    saldo = Column(Float, default=0.0, nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    despesas = relationship("Despesas", back_populates="conta", foreign_keys="[Despesas.conta_id]")
    receitas = relationship("Receitas", back_populates="conta", foreign_keys="[Receitas.conta_id]")
    transacoes_origem = relationship("Transacoes", foreign_keys="[Transacoes.conta_origem_id]", back_populates="conta_origem")
    transacoes_destino = relationship("Transacoes", foreign_keys="[Transacoes.conta_destino_id]", back_populates="conta_destino")


class Transacoes(Base):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, index=True)
    conta_origem_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    conta_destino_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    valor = Column(Float, nullable=False)
    data_transacao = Column(DateTime, default=func.now(), nullable=False)
    descricao = Column(String(250))

    conta_origem = relationship("Contas", foreign_keys=[conta_origem_id], back_populates="transacoes_origem")
    conta_destino = relationship("Contas", foreign_keys=[conta_destino_id], back_populates="transacoes_destino")
