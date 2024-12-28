import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import "primeicons/primeicons.css";
import { FooterComponent } from '../footer/footer.component';
import { QRCodeComponent } from 'angularx-qrcode';


@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [
    NavBarComponent,
    CardModule,
    ButtonModule,
    FooterComponent,
    QRCodeComponent,
  ],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css',
})
export class ContatoComponent {
 githubFilipe: string = 'https://github.com/FilipeEduardoWienhage';
 githubSpezia: string = 'https://github.com/LuisSpezia';
}

