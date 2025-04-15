import uvicorn
from .app import app
from src.database import engine, Base
from src.controllers import user_controller

# Cria as tabelas no banco de dados. Este comando verifica todos os modelos definidos em Base e cria as
# tabelas correspondentes no banco de dados.
# Em um projeto real, você pode querer usar Alembic para gerenciar migrações do banco de dados.
Base.metadata.create_all(bind=engine)

# Inclui o controlador de usuários na aplicação. Isso registra as rotas definidas no `user_controller`.
app.include_router(user_controller.router)

# Aqui você pode adicionar outros controladores (routers) de maneira semelhante:
# Se tivesse outro controlador, por exemplo, de "produtos", você faria assim:
# from app.controllers import another_controller
# app.include_router(another_controller.router)


if __name__ == "__main__":
    uvicorn.run("main:app")