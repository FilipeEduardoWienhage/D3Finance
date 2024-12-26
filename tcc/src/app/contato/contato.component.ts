import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import "primeicons/primeicons.css";

@Component({
  selector: 'app-contato',
  imports: [NavBarComponent, CardModule, ButtonModule],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css',
})
export class ContatoComponent {

}

