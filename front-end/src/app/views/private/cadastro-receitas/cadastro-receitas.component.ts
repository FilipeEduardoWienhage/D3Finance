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
import { ContasService } from '../../../service/contas.service';
import { ToastModule } from 'primeng/toast';


interface formaRecebimento {
  name: string;
}

interface categoriaReceita {
  name: string;
}

interface contaDestino {
  id: number;
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
            SplitterModule,
            ToastModule
          ],
  templateUrl: './cadastro-receitas.component.html',
  styleUrl: './cadastro-receitas.component.css',
  providers: [MessageService]
})
export class CadastroReceitasComponent {
  public requestReceita!: ReceitaRequestModel;

  constructor(
  private receitaService: ReceitasService,
  private contasService: ContasService,
  private messageService: MessageService) {}

  
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
    
    this.contasService.listarContas().subscribe({
      next: (contas) => {
        this.contaDestino = contas.map(conta => ({
          id: conta.id,
          name: conta.nome_conta
        }));
      },
      error: (erro) => {
        console.error('Erro ao carregar contas:', erro);
      }
    });
  }
  
  public doCadastroReceitas(): void {

    if (this.selecionarConta) {
      this.requestReceita.conta_id = this.selecionarConta.id;
    }

    console.log(this.requestReceita);
    this.receitaService.cadastrarReceita(this.requestReceita).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Receita cadastrada com sucesso!'
        })
        this.requestReceita = new ReceitaRequestModel();
        this.selecionarForma = undefined;
        this.selecionarCategoria = undefined;
        this.selecionarConta = undefined;
      },
      error: (erro) => {
        console.error('Erro ao cadastrar receita:', erro);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao cadastrar receita. Tente novamente.'
        });
      }
    });
  }
}
