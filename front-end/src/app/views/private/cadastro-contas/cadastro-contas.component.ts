import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-cadastro-contas',
  imports: [SplitterModule, NavBarSystemComponent, FooterComponent],
  templateUrl: './cadastro-contas.component.html',
  styleUrl: './cadastro-contas.component.css',
  providers: [
      MessageService,
    ]
})
export class CadastroContasComponent {

}
