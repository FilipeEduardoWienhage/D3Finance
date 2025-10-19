import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { HeaderSystemComponent } from '../header-system/header-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContaPagarRequestModel } from '../../../models/contas-pagar';
import { ContaPagarResponseModel, ContasPagarService } from '../../../service/contas-pagar.service';
import { ContasService, ContaResponseModel } from '../../../service/contas.service';

@Component({
  selector: 'app-contas-pagar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderSystemComponent,
    FooterComponent,
    NavBarSystemComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    CardModule,
    InputNumberModule,
    CalendarModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
    MessageModule
  ],
  templateUrl: './contas-pagar.component.html',
  styleUrls: ['./contas-pagar.component.css'],
  providers: [MessageService, ConfirmationService, DatePipe, CurrencyPipe]
})
export class ContasPagarComponent implements OnInit {

  @ViewChild('dt') table!: Table;

  itens: ContaPagarResponseModel[] = [];
  contas: ContaResponseModel[] = [];
  resumo = { pendentes: 0, pagas: 0, vencidas: 0, valorTotal: 0 };

  totalRecords = 0;
  loading = true;
  minDate = new Date();

  filtros: any = {
    status: null,
    categoria: null,
    dataVencimento: null,
    search: ''
  };

  statusOptions = [
    { label: 'Atrasado', value: 'Atrasado', severity: 'danger', icon: 'pi-times-circle' },
    { label: 'Cancelado', value: 'Cancelado', severity: 'secondary', icon: 'pi-ban' },
    { label: 'Pendente', value: 'Pendente', severity: 'warning', icon: 'pi-clock' },
    { label: 'Pago', value: 'Pago', severity: 'success', icon: 'pi-check-circle' }
  ];

  dialogVisible = false;
  modalResumoVisible = false;
  isEditing = false;
  contaEditando: ContaPagarRequestModel = this.getEmptyModel();
  filtroTimeout: any;

  formaDePagamento = [
    { name: 'Cheque' }, { name: 'Crédito' }, { name: 'Débito' },
    { name: 'Depósito' }, { name: 'Dinheiro' }, { name: 'Pix' }
  ];

  categoriaDaDespesa = [
{ name: 'Despesas Administrativas' },
{ name: 'Despesas com Marketing' },
{ name: 'Despesas com Materiais' },
{ name: 'Despesas com Pessoal' },
{ name: 'Despesas com Terceirizados' },
{ name: 'Despesas Financeiras' },
{ name: 'Despesas Operacionais' },
{ name: 'Despesas com Transporte' },
{ name: 'Impostos e Taxas' },
{ name: 'Manutenção e Reparos' },
{ name: 'Outras Despesas' }
  ];

  constructor(
    private contasService: ContasPagarService,
    private contasDisponiveisService: ContasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarContasDisponiveis();
    this.carregarResumo();
  }

  carregarContasDisponiveis() {
    this.contasDisponiveisService.listarContas().subscribe({
      next: (data) => this.contas = data,
      error: (err) => this.mostrarErro('Erro ao carregar contas disponíveis')
    });
  }

  carregarDados(event?: any): void {
    this.loading = true;
    this.contasService.listarContasPagar({ page: 1, size: 1000 }).subscribe({
      next: (response: any) => {
        let dadosFiltrados = response.items || [];
        
        dadosFiltrados = this.aplicarFiltrosLocalmente(dadosFiltrados);
        
        const page = event?.first ? Math.floor(event.first / event.rows) + 1 : 1;
        const size = event?.rows || 10;
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        
        this.itens = dadosFiltrados.slice(startIndex, endIndex);
        this.totalRecords = dadosFiltrados.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.mostrarErro('Erro ao carregar dados');
        this.loading = false;
      }
    });
  }

  carregarResumo(): void {
    this.contasService.listarContasPagar({ page: 1, size: 1000 }).subscribe({
      next: (response: any) => {
        const dadosFiltrados = this.aplicarFiltrosLocalmente(response.items || []);
        this.resumo = this.calculaResumo(dadosFiltrados);
      },
      error: (err) => {
        console.error('Erro ao carregar resumo:', err);
      }
    });
  }

  calculaResumo(items: ContaPagarResponseModel[]) {
    let pendentes = 0, pagas = 0, vencidas = 0;
    let valorTotalPendentesEVencidas = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
    
    for (const item of items) {
      if (item.status === 'Pago') {
        pagas++;
      } else {
        valorTotalPendentesEVencidas += item.valor ?? 0;
        const dataVenc = item.dataVencimento ? new Date(item.dataVencimento) : null;
        if (dataVenc) {
          dataVenc.setHours(0, 0, 0, 0); 
          if (dataVenc < hoje) {
            vencidas++;
          } else {
            pendentes++;
          }
        } else {
          pendentes++;
        }
      }
    }
    return { pendentes, pagas, vencidas, valorTotal: valorTotalPendentesEVencidas };
  }

  aplicarFiltrosLocalmente(dados: ContaPagarResponseModel[]): ContaPagarResponseModel[] {
    return dados.filter(item => {
      if (this.filtros.status) {
        const statusAtual = this.getStatusDisplay(item);
        if (statusAtual !== this.filtros.status) {
          return false;
        }
      }
      
      if (this.filtros.categoria && item.categoriaDespesa !== this.filtros.categoria) {
        return false;
      }
      
      if (this.filtros.dataVencimento) {
        const dataFiltro = new Date(this.filtros.dataVencimento);
        const dataItem = item.dataVencimento ? new Date(item.dataVencimento) : null;
        
        if (dataItem) {
          dataFiltro.setHours(0, 0, 0, 0);
          dataItem.setHours(0, 0, 0, 0);
          if (dataItem.getTime() !== dataFiltro.getTime()) {
            return false;
          }
        } else {
          return false;
        }
      }
      
      if (this.filtros.search && !item.descricao.toLowerCase().includes(this.filtros.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  aplicarFiltros(): void {
    clearTimeout(this.filtroTimeout);
    this.filtroTimeout = setTimeout(() => {
      if (this.table) {
        this.table.reset();
        this.table.first = 0;
      }
      this.carregarDados();
      this.carregarResumo();
    }, 400);
  }

  abrirDialog() {
    this.isEditing = false;
    this.dialogVisible = true;
    this.contaEditando = this.getEmptyModel();
  }

  fecharDialog() {
    this.dialogVisible = false;
    this.isEditing = false;
    setTimeout(() => this.contaEditando = this.getEmptyModel(), 300);
  }

  abrirModalResumo() {
    this.modalResumoVisible = true;
  }

  fecharModalResumo() {
    this.modalResumoVisible = false;
  }

  editarInline(item: ContaPagarResponseModel): void {
    if (item.status === 'Pago') {
      this.mostrarAviso('Não é possível editar contas já pagas');
      return;
    }
    this.isEditing = true;
    this.contaEditando = this.mapearParaEdicao(item);
    this.dialogVisible = true;
  }

  salvarConta() {
    console.log('Tentando salvar conta:', this.contaEditando);
    
    if (!this.validarFormulario()) {
      console.log('Validação falhou');
      return;
    }

    const payload: ContaPagarRequestModel = {
      ...this.contaEditando,
      dataVencimento: this.formatarData(this.contaEditando.dataVencimento)
    };
  
    console.log('Dados para enviar:', payload);

    if (this.isEditing) {
      this.contasService.editarContaPagar(this.contaEditando.id || 0, payload).subscribe({
        next: (response) => {
          console.log('Conta atualizada com sucesso:', response);
          this.dialogVisible = false;
          this.carregarDados();
          this.carregarResumo();
          this.mostrarSucesso('Conta atualizada com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao atualizar conta:', err);
          this.mostrarErro('Erro ao atualizar conta: ' + (err.error?.detail || err.message || 'Erro desconhecido'));
        }
      });
    } else {
      this.contasService.cadastrarContaPagar(payload).subscribe({
        next: (response) => {
          console.log('Conta cadastrada com sucesso:', response);
          this.dialogVisible = false;
          this.carregarDados();
          this.carregarResumo();
          this.mostrarSucesso('Conta cadastrada com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao cadastrar conta:', err);
          this.mostrarErro('Erro ao cadastrar conta: ' + (err.error?.detail || err.message || 'Erro desconhecido'));
        }
      });
    }
  }

  excluirConta(id: number) {
    this.confirmationService.confirm({
      message: 'Confirma excluir esta conta?',
      header: 'Exclusão',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.contasService.deletarContaPagar(id).subscribe({
          next: () => {
            this.carregarDados();
            this.carregarResumo();
            this.mostrarSucesso('Conta excluída com sucesso!');
          },
          error: () => this.mostrarErro('Erro ao excluir conta')
        });
      }
    });
  }

  pagarConta(item: ContaPagarResponseModel) {
    if (item.status === 'Pago') {
      this.mostrarAviso('Esta conta já foi paga');
      return;
    }

    const valorFormatado = this.currencyPipe.transform(item.valor, 'BRL', 'symbol', '1.2-2');
    this.confirmationService.confirm({
      message: `Confirma o pagamento da conta "${item.descricao || 'Sem descrição'}" no valor de ${valorFormatado}?`,
      header: 'Confirmar Pagamento',
      icon: 'pi pi-money-bill',
      acceptLabel: 'Pagar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.contasService.confirmarPagamento(item.id).subscribe({
          next: () => {
            this.carregarDados();
            this.carregarResumo();
            this.mostrarSucesso('Conta paga com sucesso!');
          },
          error: (err: any) => {
            console.error('Erro ao pagar conta:', err);
            this.mostrarErro('Erro ao confirmar pagamento: ' + (err.error?.detail || err.message || 'Erro desconhecido'));
          }
        });
      }
    });
  }

  getNomeConta(contaId: number): string {
    const conta = this.contas.find(c => c.id === contaId);
    return conta ? conta.nome_conta : 'Conta não encontrada';
  }

  getStatusSeverity(status: string): "success" | "danger" | "secondary" | "info" | "warn" | "contrast" {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    const severity = statusConfig?.severity || 'info';
    return severity as "success" | "danger" | "secondary" | "info" | "warn" | "contrast";
  }

  getStatusIcon(status: string): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig?.icon || '';
  }

  isAtrasada(item: ContaPagarResponseModel): boolean {
    if (item.status === 'Pago') return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVenc = item.dataVencimento ? new Date(item.dataVencimento) : null;
    if (dataVenc) {
      dataVenc.setHours(0, 0, 0, 0);
      return dataVenc < hoje;
    }
    return false;
  }

  getStatusDisplay(item: ContaPagarResponseModel): string {
    if (item.status === 'Pago') return 'Pago';
    if (this.isAtrasada(item)) return 'Atrasado';
    return 'Pendente';
  }

  mostrarSucesso(mensagem: string): void {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: mensagem, life: 3000 });
  }

  mostrarErro(mensagem: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: mensagem, life: 5000 });
  }

  mostrarAviso(mensagem: string): void {
    this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: mensagem, life: 4000 });
  }

  getEmptyModel(): ContaPagarRequestModel {
    return {
      conta_id: 0,
      descricao: '',
      valor: 0,
      dataVencimento: null,
      formaRecebimento: '',
      status: 'Pendente',
      categoriaDespesa: ''
    };
  }

  mapearParaEdicao(item: ContaPagarResponseModel): ContaPagarRequestModel {
    return {
      id: item.id,
      conta_id: item.conta_id,
      descricao: item.descricao,
      valor: item.valor,
      dataVencimento: item.dataVencimento,
      formaRecebimento: item.formaRecebimento,
      status: item.status,
      categoriaDespesa: item.categoriaDespesa
    };
  }

  validarFormulario(): boolean {
    const c = this.contaEditando;
    if (!c.conta_id) { this.mostrarErro('Conta obrigatória'); return false; }
    if (!c.valor || c.valor <= 0) { this.mostrarErro('Valor deve ser maior que zero'); return false; }
    if (!c.dataVencimento) { this.mostrarErro('Data de vencimento obrigatória'); return false; }
    if (!c.categoriaDespesa) { this.mostrarErro('Categoria obrigatória'); return false; }
    if (!c.formaRecebimento) { this.mostrarErro('Forma de pagamento obrigatória'); return false; }

    const dataVencimento = new Date(c.dataVencimento as any);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    dataVencimento.setHours(0, 0, 0, 0);
    if (dataVencimento < hoje) { this.mostrarErro('A data de vencimento deve ser futura'); return false; }
    return true;
  }

  formatarData(data: Date | string | null): string {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (data instanceof Date) {
      const year = data.getFullYear();
      const month = String(data.getMonth() + 1).padStart(2, '0');
      const day = String(data.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }
}