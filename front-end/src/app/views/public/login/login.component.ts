import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CommonModule } from '@angular/common';
import { InputOtpModule } from 'primeng/inputotp';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';  
import { AuthService } from '../../../service/auth.service';
import { RecuperacaoService } from '../../../service/recuperacao.service';


@Component({
  selector: 'app-login',
  imports: [
    NavBarComponent,
    FooterComponent,
    FormsModule,
    PasswordModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    CommonModule,
    InputOtpModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  providers: [MessageService, RecuperacaoService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  codigoOTP: string = '';
  novaSenhaInput: string = '';
  confirmarSenhaInput: string = '';
  codigoEnviado: boolean = false;  
  carregando: boolean = false;    
  novaSenha: boolean = false;     
  codigoInvalido: boolean = false;
  visible: boolean = false; 
  login: string = ''; 
  password: string = '';

  returnUrl: string | null = null; 

  constructor(
    private messageService: MessageService, 
    private router: Router, 
    private authService: AuthService, 
    private route: ActivatedRoute,
    private recuperacaoService: RecuperacaoService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';

    if (this.authService.isAuthenticated()) { 
      this.router.navigateByUrl(this.returnUrl!);
    }
  }

  onLoginSubmit(): void {
     this.authService.autenticar(this.login, this.password).subscribe({
      next: resposta => {
        this.authService.salvarToken(resposta.access, resposta.refresh)
        this.router.navigate(["/visaogeral"]);
      },
      error: erro => {
        console.error(erro);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Login e/ou senha inválidas'});
      }
    })
  }

  abrirModal() {
    this.visible = true;
    this.resetarModal();
  }

  resetarModal() {
    this.email = '';
    this.codigoOTP = '';
    this.novaSenhaInput = '';
    this.confirmarSenhaInput = '';
    this.codigoEnviado = false;
    this.novaSenha = false;
    this.codigoInvalido = false;
    this.carregando = false;
  }


  enviarCodigo() {
    if (!this.email || !this.validarEmail(this.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email inválido',
        detail: 'Por favor, insira um email válido.'
      });
      return;
    }

    this.carregando = true;
    
    this.recuperacaoService.enviarCodigo({ email: this.email }).subscribe({
      next: (response) => {
        this.carregando = false;
        this.codigoEnviado = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: response.message
        });
      },
      error: (error) => {
        this.carregando = false;
        console.error('Erro ao enviar código:', error);
        const mensagem = error.error?.detail || 'Erro ao enviar código. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagem
        });
      }
    });
  }

  validarCodigo() {
    if (!this.codigoOTP || this.codigoOTP.length !== 4) {
      this.messageService.add({
        severity: 'error',
        summary: 'Código inválido',
        detail: 'Por favor, insira o código de 4 dígitos.'
      });
      return;
    }

    this.carregando = true;
  
    this.recuperacaoService.validarCodigo({ 
      email: this.email, 
      codigo: this.codigoOTP 
    }).subscribe({
      next: (response) => {
        this.carregando = false;
        this.novaSenha = true;
        this.codigoInvalido = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Código válido',
          detail: response.message
        });
      },
      error: (error) => {
        this.carregando = false;
        this.codigoInvalido = true;
        console.error('Erro ao validar código:', error);
        const mensagem = error.error?.detail || 'Código inválido. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Código inválido',
          detail: mensagem
        });
      }
    });
  }
  

  salvarNovaSenha() {
    if (!this.novaSenhaInput || this.novaSenhaInput.length < 8) {
      this.messageService.add({
        severity: 'error',
        summary: 'Senha fraca',
        detail: 'A senha deve ter pelo menos 8 caracteres.'
      });
      return;
    }

    if (this.novaSenhaInput !== this.confirmarSenhaInput) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'As senhas não coincidem!'
      });
      return;
    }

    this.carregando = true;

    this.recuperacaoService.alterarSenha({
      email: this.email,
      codigo: this.codigoOTP,
      nova_senha: this.novaSenhaInput
    }).subscribe({
      next: (response) => {
        this.carregando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Senha alterada',
          detail: response.message
        });
        
        // Fechar modal e redirecionar
        setTimeout(() => {
          this.visible = false;
          this.resetarModal();
        }, 2000);
      },
      error: (error) => {
        this.carregando = false;
        console.error('Erro ao alterar senha:', error);
        const mensagem = error.error?.detail || 'Erro ao alterar senha. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagem
        });
      }
    });
  }

  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  fecharModal() {
    this.visible = false;
    this.resetarModal();
  }
}




