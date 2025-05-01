import { Component } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { SplitterModule } from 'primeng/splitter';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-movimentacao-entre-contas',
  imports: [NavBarSystemComponent, FooterComponent, SplitterModule],
  templateUrl: './movimentacao-entre-contas.component.html',
  styleUrl: './movimentacao-entre-contas.component.css',
  providers: [
    MessageService
  ]
})
export class MovimentacaoEntreContasComponent {

}
