from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, FastAPI

# Cria o roteador da API para o endpoint "/users" com a tag "users"
router = APIRouter()


app = FastAPI(
    title="D2 Finance", docs_url="/swagger"
)  # Cria uma instância do FastAPI, que será a aplicação que vai gerenciar as rotas da API


origins = [
    "http://localhost:4200",  # front-end Angular
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ou ["*"] para permitir todos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)