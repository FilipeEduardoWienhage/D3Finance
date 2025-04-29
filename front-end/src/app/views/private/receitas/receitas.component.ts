import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-receitas',
  imports: [FooterComponent, NavBarSystemComponent, SplitterModule],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.css',
  providers: [MessageService],
})
export class ReceitasComponent {

}
