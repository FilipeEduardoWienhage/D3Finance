import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cadastro-despesas',
  imports: [
  FooterComponent, 
  NavBarSystemComponent,
  CardModule,
  Fluid,
  InputNumber,
  DatePicker,
  TextareaModule,
  SelectModule,
  ButtonModule
],
  templateUrl: './cadastro-despesas.component.html',
  styleUrl: './cadastro-despesas.component.css',
  providers: [
    MessageService,
  ]
})
export class CadastroDespesasComponent {
  nomeDespesa: string = '';
  valorDespesa: number = 0;
  dataRecebimento: Date | null = null;
}
