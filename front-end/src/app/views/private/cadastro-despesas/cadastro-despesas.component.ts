import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';

@Component({
  selector: 'app-cadastro-despesas',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './cadastro-despesas.component.html',
  styleUrl: './cadastro-despesas.component.css'
})
export class CadastroDespesasComponent {

}
