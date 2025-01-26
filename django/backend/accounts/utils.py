# accounts/utils.py
import random
import string
from django.core.mail import send_mail
from django.conf import settings

def generate_confirmation_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=64))

def send_confirmation_email(user):
    token = generate_confirmation_token()
    user.confirmation_token = token
    user.save()

    confirm_url = f"http://127.0.0.1:8000/confirm_email/{token}/"
    subject = "Confirmação de E-mail"
    message = f"Clique no link para confirmar seu e-mail: {confirm_url}"

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
