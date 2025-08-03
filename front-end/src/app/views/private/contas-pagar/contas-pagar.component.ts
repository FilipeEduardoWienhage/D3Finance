import { Component } from '@angular/core';
import { HeaderSystemComponent } from '../header-system/header-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';

@Component({
  selector: 'app-contas-pagar',
  imports: [
    HeaderSystemComponent,
    FooterComponent,
    NavBarSystemComponent,
    ],
  templateUrl: './contas-pagar.component.html',
  styleUrl: './contas-pagar.component.css'
})
export class ContasPagarComponent {

}
