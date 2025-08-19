import { Component } from '@angular/core';
import { HeaderSystemComponent } from '../header-system/header-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ContaReceberRequestModel } from '../../../models/contas-receber';
import { ContaReceberResponseModel, ContasReceberService } from '../../../service/contas-receber.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

interface formaRecebimento {
  name: string;
}

interface categoriaReceita {
  name: string;
}

@Component({
  selector: 'app-contas-receber',
  imports: [
    HeaderSystemComponent,
    FooterComponent,
    NavBarSystemComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    CalendarModule,
    DropdownModule,
    SelectModule,
    InputNumber,
    DatePickerModule
  ],
  templateUrl: './contas-receber.component.html',
  styleUrl: './contas-receber.component.css'
})
export class ContasReceberComponent {
  public RequestContasReceber!: ContaReceberRequestModel;

  itens: ContaReceberRequestModel[] = [];
  dialogVisible = false;

  novaConta: ContaReceberRequestModel = {
    conta: '',
    descricao: '',
    valor: 0,
    dataPrevista: null,
    formaRecebimento: '',
    status: 'pendente',
    categoriaReceita: ''
  };


  constructor(private contasService: ContasReceberService) {}

  formaDeRecebimento: formaRecebimento[] | undefined;
  categoriaDaReceita: categoriaReceita[] | undefined;


  ngOnInit(): void {
    this.RequestContasReceber = new ContaReceberRequestModel();

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

    this.carregarContas();
  }

  carregarContas() {
    this.contasService.listarContasReceber().subscribe({
      next: (data) => this.itens = data,
      error: (err) => console.error('Erro ao carregar contas:', err)
    });
  }


  abrirDialog() {
    this.novaConta = {
      conta: '',
      descricao: '',
      valor: 0,
      dataPrevista: null,
      formaRecebimento: '',
      status: 'pendente',
      categoriaReceita: ''
    };
    this.dialogVisible = true;
  }


  fecharDialog() {
    this.dialogVisible = false;
  }

  salvarConta() {
    this.contasService.cadastrarContaReceber(this.novaConta).subscribe({
      next: () => {
        this.dialogVisible = false;
        this.carregarContas();
      },
      error: (err) => console.error('Erro ao salvar conta:', err)
    });
  }


  excluirConta(id: number) {
    this.contasService.deletarContaReceber(id).subscribe({
      next: () => this.carregarContas(),
      error: (err) => console.error('Erro ao excluir conta:', err)
    });
  }

  editarConta(item: ContaReceberResponseModel) {
    // aqui você vai abrir um dialog ou navegar para outra tela
    console.log('Editar conta:', item);
  }

  marcarComoPago(item: ContaReceberResponseModel) {
    const payload: ContaReceberRequestModel = {
      conta: item.conta,
      descricao: item.descricao,
      valor: item.valor,
      dataPrevista: item.dataPrevista,
      formaRecebimento: item.formaRecebimento,
      status: 'paga',
      categoriaReceita: item.categoriaReceita
    };
  
    this.contasService.editarContaReceber(item.id, payload).subscribe({
      next: () => this.carregarContas(),
      error: (err) => console.error('Erro ao marcar como paga:', err)
    });
  }
}

