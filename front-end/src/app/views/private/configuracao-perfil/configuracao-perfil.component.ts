import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-configuracao-perfil',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './configuracao-perfil.component.html',
  styleUrl: './configuracao-perfil.component.css',
  providers: [MessageService]
})
export class ConfiguracaoPerfilComponent {

}
