from typing import List
from fastapi import HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import Usuario
from src.api.tags import Tag
from src.schemas.usuario_schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from src.utils.auth_utils import gerar_hash_senha
from sqlalchemy.exc import IntegrityError
from src.utils.notification_utils import send_notification_background

# Endpoints
LISTA_USUARIOS = "/v1/usuarios"
CADASTRO_USUARIO = "/v1/usuarios"
ATUALIZAR_USUARIO = "/v1/usuarios/{usuario_id}"
APAGAR_USUARIO = "/v1/usuarios/{usuario_id}"
OBTER_POR_ID_USUARIO = "/v1/usuarios/{usuario_id}"

# Dependência para injeção de sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET - Listar todos os usuários
@router.get(
    path=LISTA_USUARIOS, response_model=List[UsuarioResponse], tags=[Tag.Usuarios.name]
)
def get_users(db: Session = Depends(get_db)):
    users = db.query(Usuario).all()
    return [UsuarioResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        cpf=user.cpf,
        data_nascimento=user.data_nascimento,
        sexo=user.sexo,
        profissao=user.profissao,
        cnpj=user.cnpj,
        razao_social=user.razao_social,
        cep=user.cep,
        estado=user.estado,
        cidade=user.cidade,
        bairro=user.bairro,
        usuario=user.usuario  # Incluindo o campo 'usuario'
    ) for user in users]

# GET - Obter usuário por ID
@router.get(
    path=OBTER_POR_ID_USUARIO, response_model=UsuarioResponse, tags=[Tag.Usuarios.name]
)
def get_user(usuario_id: int, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return UsuarioResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        cpf=user.cpf,
        data_nascimento=user.data_nascimento,
        sexo=user.sexo,
        profissao=user.profissao,
        cnpj=user.cnpj,
        razao_social=user.razao_social,
        cep=user.cep,
        estado=user.estado,
        cidade=user.cidade,
        bairro=user.bairro,
        usuario=user.usuario  # Incluindo o campo 'usuario'
    )

# POST - Criar usuário
@router.post(
    path=CADASTRO_USUARIO, response_model=UsuarioResponse, tags=[Tag.Usuarios.name]
)
def create_user(usuario: UsuarioCreate, db: Session = Depends(get_db)):

    try:
        senha_criptografada = gerar_hash_senha(usuario.senha)

        db_user = Usuario(
            name=usuario.name,
            email=usuario.email,
            cpf=usuario.cpf,
            data_nascimento=usuario.data_nascimento,
            sexo=usuario.sexo,
            profissao=usuario.profissao,
            cnpj=usuario.cnpj,
            razao_social=usuario.razao_social,
            cep=usuario.cep,
            estado=usuario.estado,
            cidade=usuario.cidade,
            bairro=usuario.bairro,
            usuario=usuario.usuario,
            senha=senha_criptografada
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return UsuarioResponse(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            cpf=db_user.cpf,
            data_nascimento=db_user.data_nascimento,
            sexo=db_user.sexo,
            profissao=db_user.profissao,
            cnpj=db_user.cnpj,
            razao_social=db_user.razao_social,
            cep=db_user.cep,
            estado=db_user.estado,
            cidade=db_user.cidade,
            bairro=db_user.bairro,
            usuario=db_user.usuario
        )

    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig).lower()

        if "email" in error_msg:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
        if "cpf" in error_msg:
            raise HTTPException(status_code=400, detail="CPF já cadastrado.")
        if "cnpj" in error_msg:
            raise HTTPException(status_code=400, detail="CNPJ já cadastrado.")
        if "usuario" in error_msg:
            raise HTTPException(status_code=400, detail="Nome de usuário já existe.")
        
        raise HTTPException(status_code=500, detail="Erro ao cadastrar usuário.")
    except Exception as e:
        db.rollback()
        print(f"Erro inesperado no cadastro: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor.")

# PUT - Atualizar usuário
@router.put(
    path=ATUALIZAR_USUARIO, response_model=UsuarioResponse, tags=[Tag.Usuarios.name]
)
def update_user(usuario_id: int, usuario_update: UsuarioUpdate, db: Session = Depends(get_db)):

    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Atualiza somente os campos fornecidos
    for field, value in usuario_update.__dict__.items():
        if value is not None:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return UsuarioResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        cpf=user.cpf,
        data_nascimento=user.data_nascimento,
        sexo=user.sexo,
        profissao=user.profissao,
        cnpj=user.cnpj,
        razao_social=user.razao_social,
        cep=user.cep,
        estado=user.estado,
        cidade=user.cidade,
        bairro=user.bairro,
        usuario=user.usuario  # Incluindo o campo 'usuario' na resposta
    )

# DELETE - Apagar usuário
@router.delete(
    path=APAGAR_USUARIO, tags=[Tag.Usuarios.name]
)
def delete_user(usuario_id: int, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(user)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)
