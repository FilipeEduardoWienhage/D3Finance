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
import { HeaderSystemComponent } from '../header-system/header-system.component';


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
  imports: [
    FooterComponent,
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
    ToastModule,
    HeaderSystemComponent,
  ],
  templateUrl: './cadastro-receitas.component.html',
  styleUrl: './cadastro-receitas.component.css',
  providers: [MessageService]
})
export class CadastroReceitasComponent {
  public requestReceita!: ReceitaRequestModel;
  primengConfig: any;

  constructor(
    private receitaService: ReceitasService,
    private contasService: ContasService,
    private messageService: MessageService) { }


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
      { name: 'Cheque' },
      { name: 'Crédito' },
      { name: 'Débito' },
      { name: 'Depósito' },
      { name: 'Dinheiro' },
      { name: 'Pix' }
    ];

    this.categoriaDaReceita = [
      { name: 'Multas Contratuais Recebidas' },
      { name: 'Outras Receitas Não Operacionais' },
      { name: 'Outras Receitas Operacionais' },
      { name: 'Prestação de Serviços' },
      { name: 'Recebimento de Contratos' },
      { name: 'Receita com Publicidade / Parcerias' },
      { name: 'Receitas de Aluguel de Bens' },
      { name: 'Receitas de Assinaturas / Mensalidades' },
      { name: 'Receitas de Consultoria' },
      { name: 'Receitas de Licenciamento' },
      { name: 'Recuperação de Crédito / Cobrança' },
      { name: 'Reembolso de Custos Operacionais' },
      { name: 'Rendimentos de Investimentos' },
      { name: 'Royalties Recebidos' },
      { name: 'Venda de Produtos' }
    ];

    this.contasService.listarContas().subscribe({
      next: (contas) => {
        this.contaDestino = contas
          .map(conta => ({
            id: conta.id,
            name: conta.nome_conta
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      },
      error: (erro) => {
        console.error('Erro ao carregar contas:', erro);
      }
    });


    this.primengConfig.setTranslation({
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'Sm',
      firstDayOfWeek: 0,
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
