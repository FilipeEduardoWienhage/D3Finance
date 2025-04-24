import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-importar-arquivos',
  imports: [FooterComponent, NavBarSystemComponent],
  templateUrl: './importar-arquivos.component.html',
  styleUrl: './importar-arquivos.component.css',
  providers: [MessageService]
})
export class ImportarArquivosComponent {

}
