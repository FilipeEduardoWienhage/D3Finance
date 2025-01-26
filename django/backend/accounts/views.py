import uuid
from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from .forms import EmailConfirmationForm


def send_confirmation_email(request):
    if request.method == "POST":
        form = EmailConfirmationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            
            # Verifica se o e-mail existe no banco de dados (ou cria um novo usuário)
            user = get_user_model().objects.filter(email=email).first()
            if not user:
                # Caso não exista o usuário, podemos criar um novo ou mostrar uma mensagem de erro
                user = get_user_model().objects.create(email=email, username=email)
                
            # Gerando o token
            token = uuid.uuid4().hex  # Criando um token único para a confirmação
            
            # Atualiza o campo `confirmation_token` do usuário
            user.confirmation_token = token
            user.save()

            # Enviar o e-mail com o link de confirmação
            subject = "Confirme seu e-mail"
            message = render_to_string("accounts/confirmation_email.html", {
                'user': user,
                'token': token,
                'domain': get_current_site(request).domain,
            })

            send_mail(subject, message, 'projetoproway2025@gmail.com', [email])
            return redirect('accounts:email_sent')  # Crie uma página para avisar que o e-mail foi enviado

    else:
        form = EmailConfirmationForm()

    return render(request, 'accounts/confirmation_form.html', {'form': form})


def confirm_email(request):
    # obtendo o token da url
    token = request.GET.get('token')

    # verificando se o token foi passado..
    if not token:
        return redirect('accounts:send_confirmation')  # redireciona pro formulario caso nao tenha passado token

    # Tente encontrar o usuário com o token fornecido
    user = get_user_model().objects.filter(confirmation_token=token).first()

    if user:
        # Confirme o e-mail e limpe o token
        user.email_confirmed = True
        user.confirmation_token = None  # Limpa o token após confirmação
        user.save()

        # Exiba a página de sucesso (ou redirecione para uma página específica)
        return render(request, 'accounts/email_confirmed.html')

    # Caso o token não seja encontrado ou seja inválido, redirecione para o formulário de envio de confirmação
    return redirect('accounts:send_confirmation')


def email_sent(request):
    return render(request, 'accounts/email_sent.html')
