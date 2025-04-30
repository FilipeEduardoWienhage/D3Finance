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
import { ReceitaRequestModel } from '../../../models/RequestReceitas';
import { ReceitasService } from '../../../service/receitas.service';



interface formaRecebimento {
  name: string;
}

interface categoriaReceita {
  name: string;
}

interface contaDestino {
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
  public requestReceita!: ReceitaRequestModel;

  constructor(private receitaService: ReceitasService) {}

  nomeReceita: string = '';
  categoriaReceita: string = '';
  valorReceita: number = 0;
  dataRecebimento: Date | null = null;
  formaDeRecebimento: formaRecebimento[] | undefined;
  selecionarForma: formaRecebimento | undefined;
  categoriaDaReceita: categoriaReceita[] | undefined;
  selecionarCategoria: categoriaReceita | undefined;
  contaDestino: contaDestino[] | undefined;
  selecionarConta: contaDestino | undefined;
  
  ngOnInit(): void {
    this.requestReceita = new ReceitaRequestModel();

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
    
    this.contaDestino = [
      { name: 'Banco do Brasil' },
      { name: 'Itaú' },
      { name: 'Bradesco' },
      { name: 'Santander' }
    ];
  }
  
  public doCadastro(): void {
    console.log(this.requestReceita);
    this.receitaService.cadastrarReceita(this.requestReceita).subscribe({
      next: () => alert("Cadastrado com sucesso!"),
      error: erro => {
        console.error(erro)
        alert("Erro ao efetuar o cadastro!");
      }
    });
  }
}
