"""
Configurações do Assistente Financeiro
"""
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()


class Config:
    """Configurações do sistema"""
    
    # Configurações do Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0"))
    
    # Configurações do Banco de Dados
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    DB_PORT = os.getenv("DB_PORT", "3306")
    
    @classmethod
    def validate(cls):
        """Valida se todas as configurações necessárias estão presentes"""
        missing = []
        
        if not cls.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if not cls.DB_USER:
            missing.append("DB_USER")
        if not cls.DB_PASSWORD:
            missing.append("DB_PASSWORD")
        if not cls.DB_NAME:
            missing.append("DB_NAME")
            
        if missing:
            raise ValueError(
                f"Variáveis de ambiente ausentes: {', '.join(missing)}\n"
                f"Verifique o arquivo .env na raiz do projeto"
            )
        
        return True

