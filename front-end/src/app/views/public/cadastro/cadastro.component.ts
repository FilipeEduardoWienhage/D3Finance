import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputMask } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Select } from 'primeng/select';
import { UsuarioService } from '../../../service/usuario.service';
import { UsuarioCadastroRequestModel } from '../../../models/RequestCadastro';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';



@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
  FooterComponent,
  InputTextModule,
  FormsModule,
  InputMask,
  DatePicker,
  PasswordModule,
  ButtonModule,
  StepperModule,
  CommonModule,
  NavBarComponent,
  Select,
  ToastModule,
  ],
  providers:[
  MessageService,
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent implements OnInit {
  public requestCadastro!: UsuarioCadastroRequestModel;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private messageService: MessageService,
  ) {}
  

  ngOnInit(): void {
    this.requestCadastro = new UsuarioCadastroRequestModel();
  }

  
  public doCadastro(): void {
    const senha = this.requestCadastro.password;
    const confirmar = this.requestCadastro.confirmarSenha;
  
    const senhaForte = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
    this.senhaValida = senhaForte;
    this.senhasConferem = senha === confirmar;
  
    if (!senhaForte || !this.senhasConferem) {
      if (!senhaForte) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Senha fraca',
          detail: 'A senha deve ter ao menos 8 caracteres, uma letra maiúscula e um número.'
        });
      }
  
      if (!this.senhasConferem) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'As senhas não coincidem.'
        });
      }
  
      return;
    }
  
    console.log(this.requestCadastro);
  
    this.usuarioService.cadastrarUsuario(this.requestCadastro).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cadastro efetuado com sucesso!',
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        const msg = err?.error?.detail || 'Erro desconhecido ao cadastrar.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: msg,
        });
      }
    });
  }

  public senhaValida: boolean = true;
  public senhasConferem: boolean = true;


  public activeStep: number = 1;


  public sexoOptions = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Feminino', value: 'Feminino' },
    { label: 'Outro', value: 'Outro' },
  ];
   

  public buscarCnpj(): void {
    let cnpj = this.requestCadastro.cnpj.replace(/[-_.\/]/g, '');
    console.log('CNPJ digitado:', cnpj);
  
    if (cnpj.length === 14) {
      const brasilApiUrl = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
  
      fetch(brasilApiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro na resposta da API');
          }
          return response.json();
        })
        .then((data) => {
          if (data && !data.erro) {
            this.requestCadastro.nomeEmpresa = data.razao_social;
            this.requestCadastro.estado = data.uf;
            this.requestCadastro.cidade = data.municipio;
            this.requestCadastro.bairro = data.bairro;
            this.requestCadastro.cep = data.cep.replace(/[-_.]/g, '');
  
            console.log('CNPJ encontrado:', data);
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'CNPJ encontrado com sucesso!' });
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'CNPJ não encontrado!' });
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar o CNPJ:', error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'CNPJ inválido ou erro ao buscar!' });
        });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Digite um CNPJ válido (14 números)!' });
    }
  }


}

