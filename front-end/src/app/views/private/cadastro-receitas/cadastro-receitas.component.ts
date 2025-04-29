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
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';



interface formaRecebimento {
  name: string;
}

interface categoriaReceita {
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
            ButtonModule,
            SplitterModule
          ],
  templateUrl: './cadastro-receitas.component.html',
  styleUrl: './cadastro-receitas.component.css',
  providers: [MessageService]
})
export class CadastroReceitasComponent {
  nomeReceita: string = '';
  categoriaReceita: string = '';
  valorReceita: number = 0;
  dataRecebimento: Date | null = null;
  formaDeRecebimento: formaRecebimento[] | undefined;
  selecionarForma: formaRecebimento | undefined;
  categoriaDaReceita: categoriaReceita[] | undefined;
  selecionarCategoria: categoriaReceita | undefined;
  
  ngOnInit() {
    this.formaDeRecebimento = [
      { name: 'Dinheiro' },
      { name: 'Débito' },
      { name: 'Crédito' },
      { name: 'Cheque' },
      { name: 'Depósito' },
      { name: 'Pix' }
    ];

    this.categoriaDaReceita = [
      { name: 'Venda de Produtos' },
      { name: 'Prestação de Serviços' },
      { name: 'Receitas de Assinaturas / Mensalidades' },
      { name: 'Receitas de Consultoria' },
      { name: 'Receitas de Licenciamento' },
      { name: 'Receitas de Aluguel de Bens' },
      { name: 'Receita com Publicidade / Parcerias' },
      { name: 'Recebimento de Contratos' },
      { name: 'Royalties Recebidos' },
      { name: 'Rendimentos de Investimentos' },
      { name: 'Reembolso de Custos Operacionais' },
      { name: 'Multas Contratuais Recebidas' },
      { name: 'Recuperação de Crédito / Cobrança' },
      { name: 'Outras Receitas Operacionais' },
      { name: 'Outras Receitas Não Operacionais' }
    ];
  }
}
