import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-receitas',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.css',
  providers: [MessageService],
})
export class ReceitasComponent {

}
