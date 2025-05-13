import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-configuracao-perfil',
  imports: 
  [
  FooterComponent, 
  NavBarSystemComponent, 
  SplitterModule,
  InputGroupModule,
  InputGroupAddonModule,
  InputTextModule,
  FormsModule,
  InputNumberModule,
  ButtonModule,
  ],
  templateUrl: './configuracao-perfil.component.html',
  styleUrl: './configuracao-perfil.component.css',
  providers: [MessageService]
})
export class ConfiguracaoPerfilComponent {
  constructor(private messageService: MessageService){
  }

  nome: string | undefined;

  email: string | undefined;
  
  sexo: string | undefined;
  
  profissao: string | undefined;

  cep: string | undefined;

  estado: string | undefined;

  cidade: string | undefined;

  bairro: string | undefined;

  usuario: string | undefined;

  senha: string | undefined;
  confirmarSenha: string | undefined;
}