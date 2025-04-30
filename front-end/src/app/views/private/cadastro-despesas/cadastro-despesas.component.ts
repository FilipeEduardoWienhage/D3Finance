import { Component, OnInit } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';



interface formaRecebimento {
  name: string;
}

interface contaDestino {
  name: string;
}

interface categoriaDespesa {
  name: string;
}

@Component({
  selector: 'app-cadastro-despesas',
  standalone: true,
  imports: [
    FooterComponent, 
    NavBarSystemComponent,
    CardModule,
    Fluid,
    InputNumber,
    DatePicker,
    TextareaModule,
    SelectModule,
    ButtonModule,
    FormsModule,
    SplitterModule,
  ],
  templateUrl: './cadastro-despesas.component.html',
  styleUrl: './cadastro-despesas.component.css',
  providers: [
    MessageService,
  ]
})
export class CadastroDespesasComponent{
  nomeDespesa: string = '';
  valorDespesa: number = 0;
  dataRecebimento: Date | null = null;
  formaDeRecebimento: formaRecebimento[] | undefined;
  selecionarForma: formaRecebimento | undefined;
  categoriaDespesa: string = '';
  categoriaDaDespesa: categoriaDespesa[] | undefined;  
  selecionarCategoria: categoriaDespesa | undefined;
  contaDestino: contaDestino[] | undefined;
  selecionarConta: contaDestino | undefined;
  

  ngOnInit() {
    this.categoriaDaDespesa = [
      { name: 'Despesas com Pessoal' },
      { name: 'Despesas Operacionais' },
      { name: 'Despesas com Materiais' },
      { name: 'Despesas Administrativas' },
      { name: 'Despesas com Marketing' },
      { name: 'Despesas com Transporte' },
      { name: 'Impostos e Taxas' },
      { name: 'Despesas Financeiras' },
      { name: 'Manutenção e Reparos' },
      { name: 'Despesas com Terceirizados' },
      { name: 'Outras Despesas' }
    ];
      this.formaDeRecebimento = [
        { name: 'Dinheiro' },
        { name: 'Débito' },
        { name: 'Crédito' },
        { name: 'Cheque' },
        { name: 'Depósito' },
        { name: 'Pix' }
    ];
      this.contaDestino = [
        { name: 'Banco do Brasil' },
        { name: 'Itaú' },
        { name: 'Bradesco' },
        { name: 'Santander' }
      ];
      
  }
}