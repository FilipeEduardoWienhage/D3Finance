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
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ContasService, ContaResponseModel } from '../../../service/contas.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

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
    DropdownModule,
    SelectModule,
    InputNumberModule,
    CalendarModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './contas-receber.component.html',
  styleUrl: './contas-receber.component.css'
})
export class ContasReceberComponent {
  itens: ContaReceberResponseModel[] = [];
  contas: ContaResponseModel[] = [];
  dialogVisible = false;
  minDate = new Date();

  novaConta: ContaReceberRequestModel = {
    conta_id: 0,
    descricao: '',
    valor: 0,
    dataPrevista: null,
    formaRecebimento: '',
    status: 'Pendente',
    categoriaReceita: ''
  };

  formaDeRecebimento = [
    { name: 'Cheque' },
    { name: 'Crédito' },
    { name: 'Débito' },
    { name: 'Depósito' },
    { name: 'Dinheiro' },
    { name: 'Pix' }
  ];

  categoriaDaReceita = [
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

  constructor(
    private contasService: ContasReceberService,
    private contasDisponiveisService: ContasService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarContasDisponiveis();
  }

  carregarContas() {
    this.contasService.listarContasReceber().subscribe({
      next: (data) => this.itens = data,
      error: (err) => console.error('Erro ao carregar contas:', err)
    });
  }

  carregarContasDisponiveis() {
    this.contasDisponiveisService.listarContas().subscribe({
      next: (data) => this.contas = data,
      error: (err) => console.error('Erro ao carregar contas disponíveis:', err)
    });
  }

  limparFormulario() {
    this.novaConta = {
      conta_id: 0,
      descricao: '',
      valor: 0,
      dataPrevista: null,
      formaRecebimento: '',
      status: 'Pendente',
      categoriaReceita: ''
    };
  }

  abrirDialog() {
    // Reset completo do formulário
    this.limparFormulario();
    
    // Garantir que o modal seja aberto após um pequeno delay para evitar problemas de renderização
    setTimeout(() => {
      this.dialogVisible = true;
    }, 100);
  }

  fecharDialog() {
    this.dialogVisible = false;
    
    // Reset do formulário após fechar
    setTimeout(() => {
      this.limparFormulario();
    }, 300);
  }

  salvarConta() {
    if (!this.validarFormulario()) {
      return;
    }

    const contaParaEnviar = {
      ...this.novaConta,
      dataPrevista: this.formatarData(this.novaConta.dataPrevista)
    };

    this.contasService.cadastrarContaReceber(contaParaEnviar).subscribe({
      next: (response) => {
        console.log('Conta cadastrada com sucesso:', response);
        this.dialogVisible = false;
        this.limparFormulario();
        this.carregarContas();
      },
      error: (err) => {
        console.error('Erro ao salvar conta:', err);
        alert('Erro ao salvar conta. Verifique os dados e tente novamente.');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.novaConta.conta_id || this.novaConta.conta_id <= 0) {
      alert('Selecione uma conta');
      return false;
    }

    if (!this.novaConta.valor || this.novaConta.valor <= 0) {
      alert('O valor deve ser maior que zero');
      return false;
    }

    if (!this.novaConta.dataPrevista) {
      alert('Selecione uma data prevista');
      return false;
    }

    if (!this.novaConta.categoriaReceita) {
      alert('Selecione uma categoria');
      return false;
    }

    if (!this.novaConta.formaRecebimento) {
      alert('Selecione uma forma de recebimento');
      return false;
    }

    // Verificar se a data é futura
    let dataPrevista: Date;
    if (this.novaConta.dataPrevista instanceof Date) {
      dataPrevista = this.novaConta.dataPrevista;
    } else if (typeof this.novaConta.dataPrevista === 'string') {
      dataPrevista = new Date(this.novaConta.dataPrevista);
    } else {
      alert('Data inválida');
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataPrevista.setHours(0, 0, 0, 0);

    if (dataPrevista <= hoje) {
      alert('A data prevista deve ser futura');
      return false;
    }

    return true;
  }

  formatarData(data: Date | string | null): string {
    if (!data) return '';
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (data instanceof Date) {
      const year = data.getFullYear();
      const month = String(data.getMonth() + 1).padStart(2, '0');
      const day = String(data.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  }

  excluirConta(id: number) {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      this.contasService.deletarContaReceber(id).subscribe({
        next: () => this.carregarContas(),
        error: (err) => console.error('Erro ao excluir conta:', err)
      });
    }
  }

  editarConta(item: ContaReceberResponseModel) {
    console.log('Editar conta:', item);
    // Implementar edição
  }

  marcarComoPago(item: ContaReceberResponseModel) {
    const payload: ContaReceberRequestModel = {
      conta_id: item.conta_id,
      descricao: item.descricao,
      valor: item.valor,
      dataPrevista: item.dataPrevista ? this.formatarData(item.dataPrevista) : null,
      formaRecebimento: item.formaRecebimento,
      status: 'paga',
      categoriaReceita: item.categoriaReceita
    };

    this.contasService.editarContaReceber(item.id, payload).subscribe({
      next: () => this.carregarContas(),
      error: (err) => console.error('Erro ao marcar como paga:', err)
    });
  }

  getNomeConta(contaId: number): string {
    const conta = this.contas.find(c => c.id === contaId);
    return conta ? conta.nome_conta : 'Conta não encontrada';
  }
}

