import { Component } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from "../../shared/footer/footer.component";
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-visao-geral',
  imports: [NavBarSystemComponent, FooterComponent],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.css',
  providers: [MessageService]
})
export class VisaoGeralComponent {

}
