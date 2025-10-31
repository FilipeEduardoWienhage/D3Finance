"""
Módulo de conexão com banco de dados
Adaptado para o projeto D3 Finance API
"""
import mysql.connector
from contextlib import contextmanager
from typing import Generator, Optional
from .config import Config


@contextmanager
def get_db_connection() -> Generator[mysql.connector.MySQLConnection, None, None]:
    """
    Context manager para conexão com banco de dados MySQL
    
    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM usuarios")
            results = cursor.fetchall()
    
    Yields:
        mysql.connector.MySQLConnection: Conexão com o banco de dados
        
    Raises:
        mysql.connector.Error: Se houver erro ao conectar
    """
    connection = None
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=int(Config.DB_PORT)
        )
        yield connection
    finally:
        if connection and connection.is_connected():
            connection.close()


def execute_query(query: str, params: Optional[tuple] = None, fetch_one: bool = False, return_query_info: bool = False):
    """
    Executa uma query SQL e retorna os resultados
    
    Args:
        query: Query SQL a ser executada
        params: Parâmetros para a query (para prevenir SQL injection)
        fetch_one: Se True, retorna apenas um resultado. Se False, retorna todos
        
    Returns:
        Resultado(s) da query
        
    Raises:
        mysql.connector.Error: Se houver erro na execução
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetch_one:
                return cursor.fetchone()
            else:
                return cursor.fetchall()
        finally:
            cursor.close()

