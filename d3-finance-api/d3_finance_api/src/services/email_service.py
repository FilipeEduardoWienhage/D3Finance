import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_remetente = os.getenv("EMAIL_REMETENTE")
        self.senha_email = os.getenv("SENHA_EMAIL")
        
        if not self.email_remetente or not self.senha_email:
            logger.warning("Configurações de email não encontradas. Usando modo de desenvolvimento.")
    
    def enviar_codigo_otp(self, email_destino: str, codigo: str, nome_usuario: str = "Usuário") -> bool:
        """
        Envia código OTP por email
        """
        try:
            if not self.email_remetente or not self.senha_email:
                logger.info(f"Modo desenvolvimento: Código OTP {codigo} seria enviado para {email_destino}")
                return True
            
            # Criar mensagem
            msg = MIMEMultipart()
            msg['From'] = self.email_remetente
            msg['To'] = email_destino
            msg['Subject'] = "D3 Finance - Código de Recuperação de Senha"
            
            # Corpo do email
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333; margin-bottom: 20px;">D3 Finance</h1>
                    <h2 style="color: #666; margin-bottom: 30px;">Recuperação de Senha</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                        Olá {nome_usuario}, você solicitou a recuperação de sua senha.
                    </p>
                    
                    <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; margin: 30px 0;">
                        <h3 style="margin: 0; font-size: 24px;">Seu código de verificação:</h3>
                        <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; margin: 20px 0;">
                            {codigo}
                        </div>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        Este código expira em 10 minutos.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Se você não solicitou esta recuperação, ignore este email.
                    </p>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_content, 'html'))
            
            # Conectar e enviar
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_remetente, self.senha_email)
            
            text = msg.as_string()
            server.sendmail(self.email_remetente, email_destino, text)
            server.quit()
            
            logger.info(f"Email enviado com sucesso para {email_destino}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar email: {str(e)}")
            return False
    
    def enviar_confirmacao_senha_alterada(self, email_destino: str, nome_usuario: str = "Usuário") -> bool:
        """
        Envia confirmação de alteração de senha
        """
        try:
            if not self.email_remetente or not self.senha_email:
                logger.info(f"Modo desenvolvimento: Confirmação seria enviada para {email_destino}")
                return True
            
            msg = MIMEMultipart()
            msg['From'] = self.email_remetente
            msg['To'] = email_destino
            msg['Subject'] = "D3 Finance - Senha Alterada com Sucesso"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333; margin-bottom: 20px;">D3 Finance</h1>
                    <h2 style="color: #28a745; margin-bottom: 30px;">Senha Alterada com Sucesso</h2>
                    
                    <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                        Olá {nome_usuario}, sua senha foi alterada com sucesso.
                    </p>
                    
                    <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px; margin: 30px 0;">
                        <h3 style="margin: 0;">✅ Alteração Confirmada</h3>
                        <p style="margin: 10px 0 0 0;">Sua nova senha está ativa.</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        Se você não realizou esta alteração, entre em contato conosco imediatamente.
                    </p>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_content, 'html'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_remetente, self.senha_email)
            
            text = msg.as_string()
            server.sendmail(self.email_remetente, email_destino, text)
            server.quit()
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar confirmação: {str(e)}")
            return False