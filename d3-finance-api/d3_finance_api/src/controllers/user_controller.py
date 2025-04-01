from typing import List
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database import SessionLocal
from src.models import User
from src.controllers.tags import Tag
from src.schemas import UserCreate, UserUpdate, UserResponse

# Definição das rotas de endpoints
LISTA_USUARIOS = "/v1/usuarios"  # Endpoint para listar todos os usuários
CADASTRO_USUARIO = "/v1/usuarios"  # Endpoint para cadastrar um novo usuário
ATUALIZAR_USUARIO = "/v1/usuarios/{user_id}"  # Endpoint para atualizar um usuário existente
APAGAR_USUARIO = "/v1/usuarios/{user_id}"  # Endpoint para deletar um usuário
OBTER_POR_ID_USUARIO = "/v1/usuarios/{user_id}"  # Endpoint para obter um usuário pelo seu ID


# Função de dependência para obter uma sessão do banco de dados
def get_db():
    db = SessionLocal()  # Cria uma nova sessão do banco de dados
    try:
        yield db  # Retorna a sessão de forma que o FastAPI possa utilizá-la nas rotas
    finally:
        db.close()  # Garante que a sessão será fechada após o uso


# Endpoint para obter todos os usuários
@router.get(
    path=LISTA_USUARIOS, response_model=List[UserResponse], tags=[Tag.Clientes.name]
)  # Resposta será uma lista de objetos UserResponse
def get_users(db: Session = Depends(get_db)):  # Recebe a sessão do banco como dependência
    users = db.query(User).all()  # Consulta todos os usuários no banco de dados
    # Retorna a lista de usuários convertidos para o formato UserResponse
    return [UserResponse(id=user.id, name=user.name, email=user.email) for user in users]


# Endpoint para obter um usuário específico pelo ID
@router.get(
    path=OBTER_POR_ID_USUARIO, response_model=UserResponse, tags=[Tag.Clientes.name]
)  # Resposta será um único objeto UserResponse
def get_user(user_id: int, db: Session = Depends(get_db)):  # Recebe o ID do usuário e a sessão do banco
    user = db.query(User).filter(User.id == user_id).first()  # Consulta o usuário pelo ID
    if not user:
        raise HTTPException(status_code=404, detail="User not found")  # Lança exceção se o usuário não for encontrado
    # Retorna o usuário no formato UserResponse
    return UserResponse(id=user.id, name=user.name, email=user.email)


# Endpoint para criar um novo usuário
@router.post(
    path=CADASTRO_USUARIO, response_model=UserResponse, tags=[Tag.Clientes.name]
)  # A resposta será um único objeto UserResponse
def create_user(user: UserCreate, db: Session = Depends(get_db)):  # Recebe o objeto UserCreate e a sessão do banco
    db_user = User(name=user.name, email=user.email)  # Cria um novo usuário com os dados recebidos
    db.add(db_user)  # Adiciona o usuário na sessão
    db.commit()  # Realiza a transação no banco de dados
    db.refresh(db_user)  # Atualiza o objeto db_user com os dados do banco (incluindo o ID)
    # Retorna o usuário recém-criado no formato UserResponse
    return UserResponse(id=db_user.id, name=db_user.name, email=db_user.email)


# Endpoint para atualizar um usuário existente
@router.put(
    path=ATUALIZAR_USUARIO, response_model=UserResponse, tags=[Tag.Clientes.name]
)  # A resposta será um único objeto UserResponse
def update_user(
    user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)
):  # Recebe o ID e os dados para atualização
    user = db.query(User).filter(User.id == user_id).first()  # Consulta o usuário pelo ID
    if not user:
        raise HTTPException(status_code=404, detail="User not found")  # Lança exceção se o usuário não for encontrado
    # Atualiza os dados do usuário com as informações recebidas
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    db.commit()  # Realiza a transação no banco de dados
    db.refresh(user)  # Atualiza o objeto user com os dados mais recentes
    # Retorna o usuário atualizado no formato UserResponse
    return UserResponse(id=user.id, name=user.name, email=user.email)


# Endpoint para excluir um usuário
@router.delete(
    path=APAGAR_USUARIO, tags=[Tag.Clientes.name]
)  # Esse endpoint não retorna nenhum dado, apenas confirma a exclusão
def delete_user(user_id: int, db: Session = Depends(get_db)):  # Recebe o ID do usuário e a sessão do banco
    user = db.query(User).filter(User.id == user_id).first()  # Consulta o usuário pelo ID
    if not user:
        raise HTTPException(status_code=404, detail="User not found")  # Lança exceção se o usuário não for encontrado
    db.delete(user)  # Exclui o usuário da sessão do banco de dados
    db.commit()  # Realiza a transação no banco de dados
    return Response(status_code=status.HTTP_204_NO_CONTENT)  # Retorna um status 204 sem conteúdo
