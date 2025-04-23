import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';

@Component({
  selector: 'app-cadastro-receitas',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './cadastro-receitas.component.html',
  styleUrl: './cadastro-receitas.component.css'
})
export class CadastroReceitasComponent {

}
