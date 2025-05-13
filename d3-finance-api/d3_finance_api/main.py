import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from src.app import app
from src.database.database import engine, Base
from src.api.v1.endpoints import usuario_controller, receita_controller, despesa_controller, contas_controller, importacao_controller


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://d3-finance.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Cria as tabelas no banco de dados. Este comando verifica todos os modelos definidos em Base e cria as
# tabelas correspondentes no banco de dados.
# Em um projeto real, você pode querer usar Alembic para gerenciar migrações do banco de dados.
Base.metadata.create_all(bind=engine)

# Inclui o controlador de usuários na aplicação. Isso registra as rotas definidas no `user_controller`.
app.include_router(usuario_controller.router)
app.include_router(receita_controller.router)
app.include_router(despesa_controller.router)
app.include_router(contas_controller.router)
app.include_router(importacao_controller.router)


# Aqui você pode adicionar outros controladores (routers) de maneira semelhante:
# Se tivesse outro controlador, por exemplo, de "produtos", você faria assim:
# from app.controllers import another_controller
# app.include_router(another_controller.router)


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=8000, reload=False)