import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
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
import { PrimeNG } from 'primeng/config';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    FooterComponent,
    InputTextModule,
    FormsModule,
    InputMaskModule,
    PasswordModule,
    ButtonModule,
    StepperModule,
    CommonModule,
    NavBarComponent,
    Select,
    ToastModule,
    CalendarModule
  ],
  providers: [
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
    private primengConfig: PrimeNG,
  ) { }


  maxDataPermitida = new Date(2020, 11, 31);
  minDate = new Date(1900, 0, 1);
  dataDefault = new Date(2020, 0, 1);


  ngOnInit(): void {
    this.requestCadastro = new UsuarioCadastroRequestModel();
    this.primengConfig.setTranslation({
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'Sm',
      firstDayOfWeek: 0,
    });
  }

  // public validarCampos(): boolean {
  //   this.messageService.clear();

  //   if (!this.validarStep1()) {
  //     return false;
  //   }

  //   if (!this.validarStep2()) {
  //     return false;
  //   }

  //   if (!this.validarStep3()) {
  //     return false;
  //   }
  //   return true;
  // }



  public doCadastro(): void {
    const nome = this.requestCadastro.nome;
    const senha = this.requestCadastro.password;
    const confirmar = this.requestCadastro.confirmarSenha;
    const email = this.requestCadastro.email;
    const cpf = this.requestCadastro.cpf;
    const dataNascimento = this.requestCadastro.dataNascimento;
    const sexo = this.requestCadastro.selectedSexo;
    const cargo = this.requestCadastro.cargo;
    const cnpj = this.requestCadastro.cnpj;
    const nomeEmpresa = this.requestCadastro.nomeEmpresa;
    const cep = this.requestCadastro.cep;
    const estado = this.requestCadastro.estado;
    const cidade = this.requestCadastro.cidade;
    const bairro = this.requestCadastro.bairro;
    const usuario = this.requestCadastro.usuario;

    // Limpar mensagens anteriores
    this.messageService.clear();

    // Validação de nome
    if (!nome || nome.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nome não pode ser vazio.'
      });
      return;
    }

    // Validação de senha
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

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Email inválido.'
      });
      return;
    }

    // Validação de CPF (remover formatação e validar 11 dígitos)
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    if (!cpfLimpo || cpfLimpo.length !== 11 || !/^\d{11}$/.test(cpfLimpo)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'CPF inválido. Deve conter 11 dígitos.'
      });
      return;
    }

    // Validação de data de nascimento
    if (!dataNascimento || !(dataNascimento instanceof Date) || isNaN(dataNascimento.getTime())) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Data de nascimento inválida.'
      });
      return;
    }

    // Verificar se a data não é futura
    const hoje = new Date();
    if (dataNascimento > hoje) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Data de nascimento não pode ser futura.'
      });
      return;
    }

    // Verificar se a data não é muito antiga (antes de 1900)
    const dataMinima = new Date(1900, 0, 1);
    if (dataNascimento < dataMinima) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Data de nascimento inválida.'
      });
      return;
    }

    if (!sexo || !sexo.value) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Selecione um sexo válido.'
      });
      return;
    }

    if (!cargo || cargo.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Cargo não pode ser vazio.'
      });
      return;
    }

    // Validação de CNPJ (remover formatação e validar 14 dígitos)
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    if (!cnpjLimpo || cnpjLimpo.length !== 14 || !/^\d{14}$/.test(cnpjLimpo)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'CNPJ inválido. Deve conter 14 dígitos.'
      });
      return;
    }

    if (!nomeEmpresa || nomeEmpresa.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nome da empresa não pode ser vazio.'
      });
      return;
    }

    // Validação de CEP (remover formatação e validar 8 dígitos)
    const cepLimpo = cep.replace(/[^\d]/g, '');
    if (!cepLimpo || cepLimpo.length !== 8 || !/^\d{8}$/.test(cepLimpo)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'CEP inválido. Deve conter 8 dígitos.'
      });
      return;
    }

    if (!estado || estado.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Estado não pode ser vazio.'
      });
      return;
    }

    if (!cidade || cidade.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Cidade não pode ser vazia.'
      });
      return;
    }

    if (!bairro || bairro.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Bairro não pode ser vazio.'
      });
      return;
    }

    if (!usuario || usuario.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Usuário não pode ser vazio.'
      });
      return;
    }

    // Se todas as validações passarem, prosseguir com o cadastro
    this.requestCadastro.selectedSexo = this.requestCadastro.selectedSexo || {
      label: '', value: ''
    }; // Garantir que selectedSexo não seja nulo

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
  public cpfValido: boolean = true;
  public cnpjValido: boolean = true;
  public cepValido: boolean = true;
  public emailValido: boolean = true;

  public activeStep: number = 1;

  // Validação em tempo real
  public validarSenha(): void {
    const senha = this.requestCadastro.password;
    this.senhaValida = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
  }

  public validarConfirmacaoSenha(): void {
    const senha = this.requestCadastro.password;
    const confirmar = this.requestCadastro.confirmarSenha;
    this.senhasConferem = senha === confirmar;
  }

  public validarCpf(): void {
    const cpf = this.requestCadastro.cpf;
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    this.cpfValido = cpfLimpo.length === 11 && /^\d{11}$/.test(cpfLimpo);
  }

  public validarCnpj(): void {
    const cnpj = this.requestCadastro.cnpj;
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    this.cnpjValido = cnpjLimpo.length === 14 && /^\d{14}$/.test(cnpjLimpo);
  }

  public validarCep(): void {
    const cep = this.requestCadastro.cep;
    const cepLimpo = cep.replace(/[^\d]/g, '');
    this.cepValido = cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }

  public validarEmail(): void {
    const email = this.requestCadastro.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValido = emailRegex.test(email);
  }


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

