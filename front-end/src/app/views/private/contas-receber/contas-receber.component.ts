import { Component } from '@angular/core';
import { HeaderSystemComponent } from '../header-system/header-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-contas-receber',
  imports: [
    HeaderSystemComponent,
    FooterComponent,
    NavBarSystemComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './contas-receber.component.html',
  styleUrl: './contas-receber.component.css'
})
export class ContasReceberComponent {

  itens: any[] = [];

}
