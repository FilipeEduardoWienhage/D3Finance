import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';

@Component({
  selector: 'app-configuracao-perfil',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './configuracao-perfil.component.html',
  styleUrl: './configuracao-perfil.component.css'
})
export class ConfiguracaoPerfilComponent {

}
