import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-configuracao-perfil',
  imports: [FooterComponent, NavBarSystemComponent, SplitterModule],
  templateUrl: './configuracao-perfil.component.html',
  styleUrl: './configuracao-perfil.component.css',
  providers: [MessageService]
})
export class ConfiguracaoPerfilComponent {

}
