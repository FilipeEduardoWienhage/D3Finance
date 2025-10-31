"""
Controller para o Assistente Financeiro - Endpoint FastAPI
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from src.app import router
from src.database.database import SessionLocal
from src.api.tags import Tag
from src.schemas.assistente_schemas import MensagemAssistenteRequest, MensagemAssistenteResponse
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.assistente_financeiro import AssistenteFinanceiro

# Endpoint para o chat do assistente
ASSISTENTE_CHAT = "/v1/assistente/chat"
ASSISTENTE_LIMPAR_HISTORICO = "/v1/assistente/limpar-historico"

# Armazena instâncias do assistente por usuário (cache em memória)
# Em produção, considere usar Redis ou banco de dados
_assistentes_cache = {}


def get_assistente(usuario_id: int) -> AssistenteFinanceiro:
    """
    Obtém ou cria uma instância do assistente para o usuário
    Mantém cache em memória para preservar histórico da conversa
    """
    if usuario_id not in _assistentes_cache:
        _assistentes_cache[usuario_id] = AssistenteFinanceiro(usuario_id=usuario_id)
    return _assistentes_cache[usuario_id]


@router.post(
    path=ASSISTENTE_CHAT,
    response_model=MensagemAssistenteResponse,
    tags=[Tag.AssistenteIA.name],
    summary="Fazer pergunta ao assistente financeiro",
    description="Envia uma pergunta ao assistente financeiro e recebe a resposta em linguagem natural junto com as queries SQL executadas"
)
async def chat_assistente(
    request: MensagemAssistenteRequest,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)]
):
    """
    Endpoint principal para chat com o assistente financeiro
    
    Args:
        request: Pergunta do usuário
        usuario_logado: Dados do usuário logado
        
    Returns:
        Resposta do assistente com queries executadas
    """
    try:
        usuario_id = usuario_logado.id
        
        # Obtém ou cria assistente para o usuário
        assistente = get_assistente(usuario_id)
        
        # Se não deve manter contexto, limpa o histórico
        if not request.manter_contexto:
            assistente.limpar_historico()
        
        # Faz a pergunta e captura queries executadas
        resposta = assistente.perguntar(request.pergunta, verbose=False)
        
        # Captura as queries executadas do histórico
        queries_executadas = assistente.get_queries_executadas()
        
        return MensagemAssistenteResponse(
            pergunta=request.pergunta,
            resposta=resposta,
            queries_executadas=queries_executadas,
            usuario_id=usuario_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar pergunta: {str(e)}"
        )


@router.post(
    path=ASSISTENTE_LIMPAR_HISTORICO,
    tags=[Tag.AssistenteIA.name],
    summary="Limpar histórico de conversa",
    description="Limpa o histórico de conversa do assistente para o usuário logado"
)
async def limpar_historico(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)]
):
    """
    Limpa o histórico de conversa do assistente
    """
    try:
        usuario_id = usuario_logado.id
        
        if usuario_id in _assistentes_cache:
            _assistentes_cache[usuario_id].limpar_historico()
        
        return {"mensagem": "Histórico limpo com sucesso"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao limpar histórico: {str(e)}"
        )

