import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Fluid } from 'primeng/fluid';
import { DatePicker } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';


interface formaRecebimento {
  name: string;
}

@Component({
  selector: 'app-cadastro-receitas',
  imports: [FooterComponent, 
            NavBarSystemComponent, 
            CardModule, 
            InputTextModule, 
            FormsModule,
            InputNumber,
            Fluid,
            DatePicker,
            TextareaModule,
            SelectModule,
            ButtonModule],
  templateUrl: './cadastro-receitas.component.html',
  styleUrl: './cadastro-receitas.component.css'
})
export class CadastroReceitasComponent {
  nomeReceita: string = '';
  valorReceita: number = 0;
  dataRecebimento: Date | null = null;

  formaDeRecebimento: formaRecebimento[] | undefined;

    selecionarForma: formaRecebimento | undefined;

    ngOnInit() {
        this.formaDeRecebimento = [
            { name: 'Dinheiro'},
            { name: 'Débito'},
            { name: 'Crédito'},
            { name: 'Cheque'},
            { name: 'Depósito'},
            { name: 'Pix'}
        ];
    }

}
