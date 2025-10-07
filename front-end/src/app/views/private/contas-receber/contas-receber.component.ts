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
import { ContaReceberRequestModel } from '../../../models/contas-receber';
import { ContaReceberResponseModel, ContasReceberService } from '../../../service/contas-receber.service';
import { ContasService, ContaResponseModel } from '../../../service/contas.service';

@Component({
  selector: 'app-contas-receber',
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
  templateUrl: './contas-receber.component.html',
  styleUrls: ['./contas-receber.component.css'],
  providers: [MessageService, ConfirmationService, DatePipe, CurrencyPipe]
})
export class ContasReceberComponent implements OnInit {

  @ViewChild('dt') table!: Table;

  itens: ContaReceberResponseModel[] = [];
  contas: ContaResponseModel[] = [];
  resumo = { pendentes: 0, recebidas: 0, vencidas: 0, valorTotal: 0 };

  totalRecords = 0;
  loading = true;
  minDate = new Date();

  filtros: any = {
    status: null,
    categoria: null,
    dataPrevista: null,
    search: ''
  };

  statusOptions = [
    { label: 'Atrasado', value: 'Atrasado', severity: 'danger', icon: 'pi-times-circle' },
    { label: 'Cancelado', value: 'Cancelado', severity: 'secondary', icon: 'pi-ban' },
    { label: 'Pendente', value: 'Pendente', severity: 'warning', icon: 'pi-clock' },
    { label: 'Recebido', value: 'Recebido', severity: 'success', icon: 'pi-check-circle' }
  ];

  dialogVisible = false;
  modalResumoVisible = false;
  isEditing = false;
  contaEditando: ContaReceberRequestModel = this.getEmptyModel();
  filtroTimeout: any;

  formaDeRecebimento = [
    { name: 'Cheque' }, { name: 'Crédito' }, { name: 'Débito' },
    { name: 'Depósito' }, { name: 'Dinheiro' }, { name: 'Pix' }
  ];

  categoriaDaReceita = [
    { name: 'Multas Contratuais Recebidas' }, { name: 'Outras Receitas Não Operacionais' },
    { name: 'Outras Receitas Operacionais' }, { name: 'Prestação de Serviços' },
    { name: 'Recebimento de Contratos' }, { name: 'Receita com Publicidade / Parcerias' },
    { name: 'Receitas de Aluguel de Bens' }, { name: 'Receitas de Assinaturas / Mensalidades' },
    { name: 'Receitas de Consultoria' }, { name: 'Receitas de Licenciamento' },
    { name: 'Recuperação de Crédito / Cobrança' }, { name: 'Reembolso de Custos Operacionais' },
    { name: 'Rendimentos de Investimentos' }, { name: 'Royalties Recebidos' }, { name: 'Venda de Produtos' }
  ];

  constructor(
    private contasService: ContasReceberService,
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
    this.contasService.listarContasReceber({ page: 1, size: 1000 }).subscribe({
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
    this.contasService.listarContasReceber({ page: 1, size: 1000 }).subscribe({
      next: (response: any) => {
        const dadosFiltrados = this.aplicarFiltrosLocalmente(response.items || []);
        this.resumo = this.calculaResumo(dadosFiltrados);
      },
      error: (err) => {
        console.error('Erro ao carregar resumo:', err);
      }
    });
  }

  calculaResumo(items: ContaReceberResponseModel[]) {
    let pendentes = 0, recebidas = 0, vencidas = 0;
    let valorTotalPendentesEVencidas = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
    
    for (const item of items) {
      if (item.status === 'Recebido') {
      
        recebidas++;
      } else {
        valorTotalPendentesEVencidas += item.valor ?? 0;
        const dataVenc = item.dataPrevista ? new Date(item.dataPrevista) : null;
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
    return { pendentes, recebidas, vencidas, valorTotal: valorTotalPendentesEVencidas };
  }

  aplicarFiltrosLocalmente(dados: ContaReceberResponseModel[]): ContaReceberResponseModel[] {
    return dados.filter(item => {
      if (this.filtros.status) {
        const statusAtual = this.getStatusDisplay(item);
        if (statusAtual !== this.filtros.status) {
          return false;
        }
      }
      
      if (this.filtros.categoria && item.categoriaReceita !== this.filtros.categoria) {
        return false;
      }
      
      if (this.filtros.dataPrevista) {
        const dataFiltro = new Date(this.filtros.dataPrevista);
        const dataItem = item.dataPrevista ? new Date(item.dataPrevista) : null;
        
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

  editarInline(item: ContaReceberResponseModel): void {
    if (item.status === 'Recebido') {
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

    const payload: ContaReceberRequestModel = {
    ...this.contaEditando,
    dataPrevista: this.formatarData(this.contaEditando.dataPrevista)
  };
  
  console.log('Dados para enviar:', payload);

  if (this.isEditing) {
    this.contasService.editarContaReceber(this.contaEditando.id || 0, payload).subscribe({
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
    this.contasService.cadastrarContaReceber(payload).subscribe({
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
        this.contasService.deletarContaReceber(id).subscribe({
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

  pagarConta(item: ContaReceberResponseModel) {
    if (item.status === 'Recebido') {
      this.mostrarAviso('Esta conta já foi paga');
      return;
    }

    const valorFormatado = this.currencyPipe.transform(item.valor, 'BRL', 'symbol', '1.2-2');
    this.confirmationService.confirm({
      message: `Confirma o recebimento da conta "${item.descricao || 'Sem descrição'}" no valor de ${valorFormatado}?`,
      header: 'Confirmar Recebimento',
      icon: 'pi pi-money-bill',
      acceptLabel: 'Receber',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.contasService.confirmarRecebimento(item.id).subscribe({
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

  isAtrasada(item: ContaReceberResponseModel): boolean {
    if (item.status === 'Recebido') return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVenc = item.dataPrevista ? new Date(item.dataPrevista) : null;
    if (dataVenc) {
      dataVenc.setHours(0, 0, 0, 0);
      return dataVenc < hoje;
    }
    return false;
  }

  getStatusDisplay(item: ContaReceberResponseModel): string {
    if (item.status === 'Recebido') return 'Recebido';
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

  getEmptyModel(): ContaReceberRequestModel {
    return {
      conta_id: 0,
      descricao: '',
      valor: 0,
      dataPrevista: null,
      formaRecebimento: '',
      status: 'Pendente',
      categoriaReceita: ''
    };
  }

  mapearParaEdicao(item: ContaReceberResponseModel): ContaReceberRequestModel {
    return {
      id: item.id,
      conta_id: item.conta_id,
      descricao: item.descricao,
      valor: item.valor,
      dataPrevista: item.dataPrevista,
      formaRecebimento: item.formaRecebimento,
      status: item.status,
      categoriaReceita: item.categoriaReceita
    };
  }

  validarFormulario(): boolean {
    const c = this.contaEditando;
    if (!c.conta_id) { this.mostrarErro('Conta obrigatória'); return false; }
    if (!c.valor || c.valor <= 0) { this.mostrarErro('Valor deve ser maior que zero'); return false; }
    if (!c.dataPrevista) { this.mostrarErro('Data prevista obrigatória'); return false; }
    if (!c.categoriaReceita) { this.mostrarErro('Categoria obrigatória'); return false; }
    if (!c.formaRecebimento) { this.mostrarErro('Forma de recebimento obrigatória'); return false; }

    const dataPrevista = new Date(c.dataPrevista as any);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    dataPrevista.setHours(0, 0, 0, 0);
    if (dataPrevista < hoje) { this.mostrarErro('A data prevista deve ser futura'); return false; }
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