import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';

@Component({
  selector: 'app-despesas',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.css'
})
export class DespesasComponent {

}
