import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { Splitter } from 'primeng/splitter';

@Component({
  selector: 'app-despesas',
  imports: [FooterComponent, NavBarSystemComponent, Splitter],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.css',
  providers: [MessageService]
})
export class DespesasComponent {

}
