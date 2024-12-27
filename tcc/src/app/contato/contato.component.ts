import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import "primeicons/primeicons.css";
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-contato',
  imports: [NavBarComponent, CardModule, ButtonModule, FooterComponent],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css',
})
export class ContatoComponent {

}

