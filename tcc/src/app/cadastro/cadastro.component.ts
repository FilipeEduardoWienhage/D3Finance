import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FooterComponent } from '../footer/footer.component';
import { SplitterModule } from 'primeng/splitter';
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
    SplitterModule,
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
  username: string = '';
  senha: string = '';
  confirmarSenha: string = '';
  fotoPerfil: File | null = null;
  estado: string = '';
  cidade: string = '';
  bairro: string = '';


  onSubmit(): void {
    // Verifica se a senha e a confirmação são iguais
    if (this.senha !== this.confirmarSenha) {
      alert('As senhas não conferem!');
      return;
    }

    const dadosUsuario = {
      nome: this.nome,
      email: this.email,
      cpf: this.cpf,
      dataNascimento: this.dataNascimento,
      username: this.username,
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