import stripe
import os
from datetime import datetime, timedelta
from typing import Annotated
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from src.app import router
from src.database.database import SessionLocal
from src.database.models import UsuarioAssinatura, Usuario
from src.schemas.stripe_schemas import CriarAssinaturaRequest, AssinaturaResponse, StatusAssinatura
from src.services.autenticacao_service import get_current_user
from src.schemas.autenticacao_schemas import TokenData
from src.api.tags import Tag

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

PLANOS = {
    "mensal": {
        "preco": 29.90,
        "stripe_price_id": "price_COLOQUE_SEU_PRICE_ID_MENSAL",
        "nome": "Plano Mensal"
    },
    "semestral": {
        "preco": 149.90,
        "stripe_price_id": "price_COLOQUE_SEU_PRICE_ID_SEMESTRAL", 
        "nome": "Plano Semestral"
    },
    "anual": {
        "preco": 299.90,
        "stripe_price_id": "price_COLOQUE_SEU_PRICE_ID_ANUAL",
        "nome": "Plano Anual"
    }
}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/v1/stripe/assinar", response_model=AssinaturaResponse, tags=[Tag.Pagamentos.name])
def criar_assinatura(
    request: CriarAssinaturaRequest,
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    
    if request.plano not in PLANOS:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    plano = PLANOS[request.plano]
    usuario = db.query(Usuario).filter(Usuario.id == usuario_logado.id).first()

    try:
        # Criar/buscar customer
        customer = stripe.Customer.create(
            email=usuario.email,
            name=usuario.name,
            metadata={'usuario_id': str(usuario.id)}
        )
        
        # Criar checkout session
        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card', 'pix', 'boleto'],
            line_items=[{
                'price': plano['stripe_price_id'],
                'quantity': 1,
            }],
            mode='subscription',
            success_url='http://localhost:4200/assinatura/sucesso',
            cancel_url='http://localhost:4200/assinatura',
            metadata={
                'usuario_id': str(usuario.id),
                'plano': request.plano
            }
        )
        
        return AssinaturaResponse(
            checkout_url=session.url,
            session_id=session.id
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro: {str(e)}")

@router.get("/v1/stripe/status", response_model=StatusAssinatura, tags=[Tag.Pagamentos.name])
def obter_status_assinatura(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Obter status da assinatura atual"""
    
    assinatura = db.query(UsuarioAssinatura).filter(
        UsuarioAssinatura.usuario_id == usuario_logado.id,
        UsuarioAssinatura.status.in_(["active", "trial"])
    ).first()
    
    if not assinatura:
        raise HTTPException(status_code=404, detail="Sem assinatura ativa")
    
    return StatusAssinatura(
        plano=assinatura.plano,
        status=assinatura.status,
        preco=assinatura.preco,
        periodo_teste=assinatura.periodo_teste,
        data_inicio=assinatura.data_inicio,
        data_fim=assinatura.data_fim,
        data_teste_fim=assinatura.data_teste_fim
    )

@router.post("/v1/stripe/cancelar", tags=[Tag.Pagamentos.name])
def cancelar_assinatura(
    usuario_logado: Annotated[TokenData, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Cancelar assinatura"""
    
    assinatura = db.query(UsuarioAssinatura).filter(
        UsuarioAssinatura.usuario_id == usuario_logado.id,
        UsuarioAssinatura.status == "active"
    ).first()
    
    if not assinatura:
        raise HTTPException(status_code=404, detail="Sem assinatura para cancelar")
    
    try:
        # Cancelar no Stripe
        if assinatura.stripe_subscription_id:
            stripe.Subscription.delete(assinatura.stripe_subscription_id)
        
        # Atualizar no banco
        assinatura.status = "canceled"
        assinatura.data_fim = datetime.now()
        db.commit()
        
        return {"message": "Assinatura cancelada"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro: {str(e)}")

@router.post("/v1/stripe/webhook", tags=[Tag.Pagamentos.name])
async def webhook_stripe(request: Request, db: Session = Depends(get_db)):
    """Webhook para processar eventos do Stripe"""
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except:
        raise HTTPException(status_code=400, detail="Webhook inválido")
    
    # Processar evento de assinatura criada
    if event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        customer_id = subscription['customer']
        
        # Buscar customer para obter usuario_id
        customer = stripe.Customer.retrieve(customer_id)
        usuario_id = int(customer['metadata']['usuario_id'])
        
        # Determinar plano baseado no price_id
        price_id = subscription['items']['data'][0]['price']['id']
        plano = None
        preco = 0
        
        for nome, config in PLANOS.items():
            if config['stripe_price_id'] == price_id:
                plano = nome
                preco = config['preco']
                break
        
        if plano:
            # Salvar assinatura no banco
            nova_assinatura = UsuarioAssinatura(
                usuario_id=usuario_id,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription['id'],
                plano=plano,
                status="ativa",
                preco=preco,
                data_inicio=datetime.now()
            )
            db.add(nova_assinatura)
            db.commit()
    
    # Processar cancelamento
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        
        assinatura = db.query(UsuarioAssinatura).filter(
            UsuarioAssinatura.stripe_subscription_id == subscription['id']
        ).first()
        
        if assinatura:
            assinatura.status = "cancelada"
            assinatura.data_fim = datetime.now()
            db.commit()
    
    return {"status": "ok"}
