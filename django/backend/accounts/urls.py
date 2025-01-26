from django.urls import path
from . import views

urlpatterns = [
    path('confirm_email/', views.confirm_email, name='confirm_email'),  # pagina confirmar email
    path('send_confirmation/', views.send_confirmation_email, name='send_confirmation'),  # formulario para enviar link
    path('email_sent/', views.email_sent, name='email_sent'),  # pagina que informa que o email foi enviado
    # path('email_confirmed/',views.confirm_email, name='') 
]
