from sqlalchemy import Boolean, Column, DateTime, Integer, String, Date, ForeignKey, Float, func, UniqueConstraint
from src.database.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    cpf = Column(String(11), unique=True, index=True, nullable=False)  # Ajustado para 11 dígitos
    data_nascimento = Column(Date, nullable=False)
    sexo = Column(String(20), nullable=False)
    profissao = Column(String(45), nullable=False)
    cnpj = Column(String(14), unique=True, nullable=False)  # Ajustado para 14 dígitos
    razao_social = Column(String(55), nullable=False)
    cep = Column(String(8), nullable=False)  # Ajustado para 8 dígitos
    estado = Column(String(2), nullable=False)
    cidade = Column(String(30), nullable=False)
    bairro = Column(String(30), nullable=False)
    usuario = Column(String(30), unique=True, nullable=False)
    senha = Column(String(250), nullable=False)

    contas = relationship("Contas", back_populates="usuario", cascade="all, delete-orphan")
    receitas = relationship("Receitas", back_populates="usuario", cascade="all, delete-orphan")
    despesas = relationship("Despesas", back_populates="usuario", cascade="all, delete-orphan")
    contas_receber = relationship("ContasReceber", back_populates="usuario", cascade="all, delete-orphan")
    telegram_config = relationship("TelegramConfig", back_populates="usuario", uselist=False, cascade="all, delete-orphan")


class Receitas(Base):
    __tablename__ = "receitas"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String(50), nullable=False)
    valor_recebido = Column(Float, nullable=False)
    data_recebimento = Column(Date, nullable=False)
    descricao = Column(String(250))
    forma_recebimento = Column(String(50), nullable=False)
    conta_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)
    
    
    usuario = relationship("Usuario", back_populates="receitas")
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
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    usuario = relationship("Usuario", back_populates="despesas")
    conta = relationship("Contas", back_populates="despesas", foreign_keys=[conta_id])


class Contas(Base):
    __tablename__ = "contas"

    id = Column(Integer, primary_key=True, index=True)
    tipo_conta = Column(String(50), nullable=False)
    nome_conta = Column(String(50), nullable=False)
    saldo = Column(Float, default=0.0, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    # Constraint composta: nome_conta deve ser único por usuário
    __table_args__ = (
        UniqueConstraint('nome_conta', 'usuario_id', name='uq_nome_conta_usuario'),
    )

    usuario = relationship("Usuario", back_populates="contas")
    despesas = relationship("Despesas", back_populates="conta", foreign_keys="[Despesas.conta_id]")
    receitas = relationship("Receitas", back_populates="conta", foreign_keys="[Receitas.conta_id]")
    contas_receber = relationship("ContasReceber", back_populates="conta", foreign_keys="[ContasReceber.conta_id]")
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
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    usuario = relationship("Usuario")
    conta_origem = relationship("Contas", foreign_keys=[conta_origem_id], back_populates="transacoes_origem")
    conta_destino = relationship("Contas", foreign_keys=[conta_destino_id], back_populates="transacoes_destino")

class CodigoRecuperacao(Base):
    __tablename__ = "codigos_recuperacao"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    codigo = Column(String(4), nullable=False)
    expiracao = Column(DateTime, nullable=False)
    usado = Column(Boolean, default=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<CodigoRecuperacao(id={self.id}, email={self.email}, usado={self.usado})>"
    

class TelegramConfig(Base):
    __tablename__ = "telegram_config"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, unique=True)
    chat_id = Column(String(50), nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    usuario = relationship("Usuario", back_populates="telegram_config")

    def __repr__(self):
        return f"<TelegramConfig(id={self.id}, usuario_id={self.usuario_id}, ativo={self.ativo})>"
    


class ContasReceber(Base):
    __tablename__ = "contas_receber"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(250))
    valor = Column(Float, nullable=False)
    data_prevista = Column(Date, nullable=False)
    categoria_receita = Column(String(50), nullable=False)
    forma_recebimento = Column(String(50), nullable=False)
    status = Column(String(20), default="Pendente", nullable=False)  # Pendente, Recebido, Cancelado
    conta_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_alteracao = Column(DateTime, onupdate=func.now(), nullable=True)

    usuario = relationship("Usuario", back_populates="contas_receber")
    conta = relationship("Contas", back_populates="contas_receber", foreign_keys=[conta_id])

    def __repr__(self):
        return f"<ContasReceber(id={self.id}, descricao={self.descricao}, valor={self.valor}, status={self.status})>"