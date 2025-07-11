import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CardModule } from 'primeng/card';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-planos',
  imports: [NavBarComponent, CardModule, FooterComponent],
  templateUrl: './planos.component.html',
  styleUrl: './planos.component.css'
})
export class PlanosComponent {

}
