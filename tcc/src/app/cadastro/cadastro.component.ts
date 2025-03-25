import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputMask } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Select } from 'primeng/select';
import { Sexo, Usuario } from '../models/cadastro';

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
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent implements OnInit {
  activeStep: number = 1;
  usuario: Usuario = new Usuario();
  sexoOptions: Sexo[] = [];

  ngOnInit() {
    this.sexoOptions = [
      { name: 'Masculino', code: 'MASC' },
      { name: 'Feminino', code: 'FEM' },
      { name: 'Outro', code: 'NA' },
    ];
  }

  buscarEndereco(): void {
    let cep = this.usuario.cep.replace(/[-_.]/g, '');

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
            this.usuario.endereco = {
              uf: data.uf,
              localidade: data.localidade,
              bairro: data.bairro,
            };
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

