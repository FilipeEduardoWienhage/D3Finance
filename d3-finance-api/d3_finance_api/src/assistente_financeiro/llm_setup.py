"""
Configuração e inicialização do LLM (Groq)
"""
from langchain_groq import ChatGroq
from .config import Config


def get_llm():
    """
    Inicializa e retorna o LLM configurado (Groq)
    
    Returns:
        ChatGroq: Instância do LLM configurado
        
    Raises:
        ValueError: Se as configurações não estiverem completas
        Exception: Se houver erro ao inicializar o Groq
    """
    Config.validate()
    
    try:
        llm = ChatGroq(
            model_name=Config.GROQ_MODEL,
            temperature=Config.GROQ_TEMPERATURE,
            api_key=Config.GROQ_API_KEY
        )
        return llm
    except Exception as e:
        raise Exception(
            f"Erro ao inicializar o Groq: {e}\n"
            f"Verifique se a variável GROQ_API_KEY está definida corretamente."
        )

