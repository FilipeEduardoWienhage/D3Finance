import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from src.app import app
from src.database.database import engine, Base
from src.api.v1.endpoints import usuario_controller, receita_controller, despesa_controller, contas_controller, importacao_controller, transacoes_controller, autenticacao_controller, recuperacao_controller



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Inclui o controlador de usuários na aplicação. Isso registra as rotas definidas no `user_controller`.
app.include_router(usuario_controller.router)
app.include_router(receita_controller.router)
app.include_router(despesa_controller.router)
app.include_router(contas_controller.router)
app.include_router(importacao_controller.router)
app.include_router(transacoes_controller.router)
app.include_router(autenticacao_controller.router)
app.include_router(recuperacao_controller.router)


if __name__ == "__main__":
    uvicorn.run("main:app")
