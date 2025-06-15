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
  providers: [MessageService],
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

  returnUrl: string | null = null;  // ✅ ajuste de tipagem aqui

  constructor(
    private messageService: MessageService, 
    private router: Router, 
    private authService: AuthService, 
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';

    if (this.authService.isAuthenticated()) {  // ✅ mudou para isAuthenticated()
      this.router.navigateByUrl(this.returnUrl!);
    }
  }

  onLoginSubmit(): void {
    this.carregando = true;

    this.authService.autenticar(this.login, this.password).subscribe(
      response => {
        this.carregando = false;

        // ✅ chama salvarToken com access e refresh
        this.authService.salvarToken(response.access, response.refresh);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Login realizado com sucesso!',
        });

        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl!);
        }, 1000);
      },
      error => {
        this.carregando = false;

        let errorMessage = 'Ocorreu um erro no login. Verifique suas credenciais.';
        if (error.status === 400 && error.error && error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão ou a URL da API.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Login',
          detail: errorMessage,
        });
      }
    );
  }

  abrirModal() {
    this.visible = true;
  }

  enviarCodigo() {
    this.carregando = true;
    setTimeout(() => {
      this.carregando = false;
      this.codigoEnviado = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Código enviado para o seu e-mail!',
      });
    }, 2000);
  }

  validarCodigo() {
    this.carregando = true;
  
    setTimeout(() => {
      this.carregando = false;
  
      if (this.codigoOTP === '1234') {
        this.novaSenha = true;
        this.codigoInvalido = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Código válido',
          detail: 'Código verificado com sucesso. Crie sua nova senha.',
        });
      } else {
        this.codigoInvalido = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Código inválido',
          detail: 'O código inserido está incorreto. Tente novamente.',
        });
      }
    }, 2000);
  }
  

  salvarNovaSenha() {
    if (this.novaSenhaInput === this.confirmarSenhaInput) {
      this.messageService.add({
        severity: 'success',
        summary: 'Senha alterada',
        detail: 'Sua senha foi alterada com sucesso!',
      });
      setTimeout(() => {
        this.router.navigate(['/visaogeral']);
      }, 1500);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'As senhas não coincidem!',
      });
    }
  }
}




