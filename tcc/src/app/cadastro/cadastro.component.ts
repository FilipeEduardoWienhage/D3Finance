import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FooterComponent } from '../footer/footer.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputMask } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

interface Endereco {
  uf: string,
  localidade: string,
  bairro: string,
}

@Component({
  selector: 'app-cadastro',
  imports: [
    NavBarComponent,
    FooterComponent,
    InputTextModule,
    FormsModule,
    InputMask,
    DatePicker,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  nome: string = '';
  email: string = '';
  cpf: string = '';
  cep: string = '';
  dataNascimento: Date[] | undefined;
  senha: string = '';
  confirmarSenha: string = '';
  estado: string = '';
  cidade: string = '';
  bairro: string = '';


  onSubmit(): void {

    if (!this.nome || !this.email || !this.cpf || !this.cep || !this.dataNascimento || !this.senha || !this.confirmarSenha) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.email)) {
      alert('Por favor, insira um e-mail válido!');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      alert('As senhas não conferem!');
      return;
    }

    const dadosUsuario = {
      nome: this.nome,
      email: this.email,
      cpf: this.cpf,
      dataNascimento: this.dataNascimento,
      senha: this.senha,
    };

    console.log('Dados do usuário:', dadosUsuario);
    alert('Cadastro realizado com sucesso!');
  }

  endereco: Endereco = {
    uf: '',
    localidade: '',
    bairro: '',
  };


  buscarEndereco(): void {
    let cep = this.cep.replace("-", "").replace("_", "").replace(".", "");

    if (cep.length === 8) {
      const viaCepUrl = `https://viacep.com.br/ws/${cep}/json/`;

      fetch(viaCepUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro na resposta da API');
          }
          return response.json();
        })
        .then((data) => {
          if (!data.erro) {
            // Atualiza as propriedades vinculadas aos inputs
            this.estado = data.uf;
            this.cidade = data.localidade;
            this.bairro = data.bairro;
            console.log('Endereço encontrado:', data);
          } else {
            alert('CEP não encontrado!');
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar o CEP:', error);
          alert('Erro ao buscar o CEP!');
        });
    } else {
      alert('Digite um CEP válido (8 números)!');
    }
  }

}