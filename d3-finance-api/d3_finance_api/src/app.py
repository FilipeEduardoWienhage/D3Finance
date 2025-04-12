from fastapi import APIRouter, FastAPI

# Cria o roteador da API para o endpoint "/users" com a tag "users"
router = APIRouter()


app = FastAPI(
    title="Projeto Exemplo", docs_url="/swagger"
)  # Cria uma instância do FastAPI, que será a aplicação que vai gerenciar as rotas da API