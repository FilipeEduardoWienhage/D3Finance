import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Configure o Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# funcao que le o arquivo html
def read_html_file(file_path):
    with open(file_path, 'r') as file:
        return file.read()

# testando o envio do email
def send_test_email():
    try:
        #caminho para o html
        html_content = read_html_file('accounts/templates/accounts/confirmation_email.html')

        send_mail(
            'Teste de confirmação de e-mail',  # titulo do email
            '',  # conteudo do email, vazio por que esta mandadno o arquivo html
            settings.EMAIL_HOST_USER,  # email_host_user, vem do settings.py
            ['lhspezia777@gmail.com'],  # destinatario
            fail_silently=False,
            html_message=html_content  # envia o conteudo html
        )
        print("E-mail enviado com sucesso!")
    except Exception as e:
        print(f"Ocorreu um erro ao enviar o e-mail: {e}")

if __name__ == '__main__':
    send_test_email()
