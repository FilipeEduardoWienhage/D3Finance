from typing import List, Annotated
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Transacoes, Contas
from src.api.tags import Tag
from src.schemas.transacoes_schemas import TransacoesCreate, TransacoesUpdate, TransacoesResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.utils.notification_utils import send_notification_background
from src.services.telegram_service import telegram_service


LISTA_TRANSACOES = "/v1/transacoes"
CADASTRO_TRANSACOES = "/v1/transacoes"
ATUALIZAR_TRANSACOES = "/v1/transacoes/{transacoes_id}"
APAGAR_TRANSACOES = "/v1/transacoes/{transacoes_id}"
OBTER_POR_ID_TRANSACOES = "/v1/transacoes/{transacoes_id}"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    path=LISTA_TRANSACOES, response_model=List[TransacoesResponse], tags=[Tag.Transacoes.name]
)
def get_transacoes(usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    transacoes = db.query(Transacoes).filter(Transacoes.usuario_id == usuario_logado.id).all()
    return [TransacoesResponse(
        id=transacao.id,
        conta_origem_id=transacao.conta_origem_id,
        conta_destino_id=transacao.conta_destino_id,
        valor=transacao.valor,
        descricao=transacao.descricao,
        data_transacao=transacao.data_transacao,
    ) for transacao in transacoes]


@router.get(
    path=OBTER_POR_ID_TRANSACOES, response_model=TransacoesResponse, tags=[Tag.Transacoes.name]
)
def get_transacao_by_id(transacoes_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    transacao = db.query(Transacoes).filter(Transacoes.id == transacoes_id, Transacoes.usuario_id == usuario_logado.id).first()
    if not transacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada",
        )
    return TransacoesResponse(
        id=transacao.id,
        conta_origem_id=transacao.conta_origem_id,
        conta_destino_id=transacao.conta_destino_id,
        valor=transacao.valor,
        descricao=transacao.descricao,
        data_transacao=transacao.data_transacao,
    )


@router.post(
    path=CADASTRO_TRANSACOES, response_model=TransacoesResponse, tags=[Tag.Transacoes.name]
)
def create_transacao(transacao: TransacoesCreate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    # VALIDAÇÃO: Verificar se conta origem e destino são diferentes
    if transacao.conta_origem_id == transacao.conta_destino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A conta origem e a conta destino não podem ser a mesma."
        )
    
    # VALIDAÇÃO: Verificar se o valor é maior que zero
    if transacao.valor <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O valor deve ser maior que zero."
        )
    
    conta_origem = db.query(Contas).filter(Contas.id == transacao.conta_origem_id, Contas.usuario_id == usuario_logado.id).first()
    conta_destino = db.query(Contas).filter(Contas.id == transacao.conta_destino_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta_origem or not conta_destino:
        raise HTTPException(status_code=404, detail="Conta origem ou destino não encontrada ou não pertence ao usuário")
    if conta_origem.saldo < transacao.valor:
        raise HTTPException(status_code=400, detail="Saldo insuficiente na conta de origem")
    conta_origem.saldo -= transacao.valor
    conta_destino.saldo += transacao.valor
    db_transacao = Transacoes(
        conta_origem_id=transacao.conta_origem_id,
        conta_destino_id=transacao.conta_destino_id,
        valor=transacao.valor,
        descricao=transacao.descricao,
        usuario_id=usuario_logado.id
    )
    db.add(db_transacao)
    db.commit()
    send_notification_background("transacao", db, transacao=db_transacao)
    db.refresh(db_transacao)

    # Envia notificação do Telegram
    try:
        telegram_service.notify_movimentacao_contas(
            usuario_id=usuario_logado.id,
            valor=transacao.valor,
            conta_origem=conta_origem.nome_conta,
            conta_destino=conta_destino.nome_conta,
            descricao=transacao.descricao or "Movimentação entre contas"
        )
    except Exception as e:
        # Log do erro mas não falha a operação
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro ao enviar notificação do Telegram para transação: {e}")

    return TransacoesResponse(
        id=db_transacao.id,
        conta_origem_id=db_transacao.conta_origem_id,
        conta_destino_id=db_transacao.conta_destino_id,
        valor=db_transacao.valor,
        descricao=db_transacao.descricao,
        data_transacao=db_transacao.data_transacao,
    )


@router.put(
    path=ATUALIZAR_TRANSACOES, response_model=TransacoesResponse, tags=[Tag.Transacoes.name]
)
def update_transacao(transacoes_id: int, transacao_update: TransacoesUpdate, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    transacao = db.query(Transacoes).filter(Transacoes.id == transacoes_id, Transacoes.usuario_id == usuario_logado.id).first()
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    # VALIDAÇÃO: Verificar se conta origem e destino são diferentes (se estiver sendo atualizado)
    if hasattr(transacao_update, 'conta_origem_id') and hasattr(transacao_update, 'conta_destino_id'):
        if transacao_update.conta_origem_id == transacao_update.conta_destino_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A conta origem e a conta destino não podem ser a mesma."
            )
    
    # VALIDAÇÃO: Verificar se o valor é maior que zero (se estiver sendo atualizado)
    if hasattr(transacao_update, 'valor') and transacao_update.valor is not None:
        if transacao_update.valor <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O valor deve ser maior que zero."
            )
    
    conta_origem_atual = db.query(Contas).filter(Contas.id == transacao.conta_origem_id, Contas.usuario_id == usuario_logado.id).first()
    conta_destino_atual = db.query(Contas).filter(Contas.id == transacao.conta_destino_id, Contas.usuario_id == usuario_logado.id).first()
    valor_antigo = transacao.valor
    origem_antiga_id = transacao.conta_origem_id
    destino_antiga_id = transacao.conta_destino_id
    for field, value in transacao_update.__dict__.items():
        if value is not None:
            setattr(transacao, field, value)
    conta_origem_nova = db.query(Contas).filter(Contas.id == transacao.conta_origem_id, Contas.usuario_id == usuario_logado.id).first()
    conta_destino_nova = db.query(Contas).filter(Contas.id == transacao.conta_destino_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta_origem_nova or not conta_destino_nova:
        raise HTTPException(status_code=404, detail="Conta origem ou destino não encontrada após atualização ou não pertence ao usuário")
    valor_novo = transacao.valor
    if origem_antiga_id == destino_antiga_id:
        conta_origem_atual.saldo += valor_antigo
    else:
        conta_origem_atual.saldo += valor_antigo
        conta_destino_atual.saldo -= valor_antigo
    if conta_origem_nova.saldo < valor_novo:
        raise HTTPException(status_code=400, detail="Saldo insuficiente na conta de origem para atualização")
    if conta_origem_nova.id == conta_destino_nova.id:
        conta_origem_nova.saldo -= valor_novo
    else:
        conta_origem_nova.saldo -= valor_novo
        conta_destino_nova.saldo += valor_novo
    db.commit()
    db.refresh(transacao)
    return TransacoesResponse(
        id=transacao.id,
        conta_origem_id=transacao.conta_origem_id,
        conta_destino_id=transacao.conta_destino_id,
        valor=transacao.valor,
        descricao=transacao.descricao,
        data_transacao=transacao.data_transacao,
    )


@router.delete(
    path=APAGAR_TRANSACOES, tags=[Tag.Transacoes.name]
)
def delete_transacao(transacoes_id: int, usuario_logado: Annotated[TokenData, Depends(get_current_user)], db: Session = Depends(get_db)):
    transacao = db.query(Transacoes).filter(Transacoes.id == transacoes_id, Transacoes.usuario_id == usuario_logado.id).first()
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    conta_origem = db.query(Contas).filter(Contas.id == transacao.conta_origem_id, Contas.usuario_id == usuario_logado.id).first()
    conta_destino = db.query(Contas).filter(Contas.id == transacao.conta_destino_id, Contas.usuario_id == usuario_logado.id).first()
    if not conta_origem or not conta_destino:
        raise HTTPException(status_code=404, detail="Conta origem ou destino não encontrada ou não pertence ao usuário")
    if conta_origem.id == conta_destino.id:
        conta_origem.saldo += transacao.valor
    else:
        conta_origem.saldo += transacao.valor
        conta_destino.saldo -= transacao.valor
    db.delete(transacao)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
