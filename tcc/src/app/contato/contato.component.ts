import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import "primeicons/primeicons.css";
import { QRCodeComponent } from 'angularx-qrcode';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [
    NavBarComponent,
    CardModule,
    ButtonModule,
    QRCodeComponent,
    FooterComponent,
  ],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css',
})
export class ContatoComponent {
 githubFilipe: string = 'https://github.com/FilipeEduardoWienhage';
 githubSpezia: string = 'https://github.com/LuisSpezia';
}

