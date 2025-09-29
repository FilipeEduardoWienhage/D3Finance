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
  resumo = { pendentes: 0, pagas: 0, vencidas: 0, valorTotal: 0 };

  totalRecords = 0;
  loading = true;
  minDate = new Date();

  filtros: any = {
    status: null,
    categoria: null,
    dataInicio: null,
    dataFim: null,
    search: ''
  };

  statusOptions = [
    { label: 'Pendente', value: 'Pendente', severity: 'warning', icon: 'pi-clock' },
    { label: 'Pago', value: 'Recebido', severity: 'success', icon: 'pi-check-circle' },
    { label: 'Vencido', value: 'Vencido', severity: 'danger', icon: 'pi-times-circle' },
    { label: 'Cancelado', value: 'Cancelado', severity: 'secondary', icon: 'pi-ban' }
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
  }


  carregarContasDisponiveis() {
    this.contasDisponiveisService.listarContas().subscribe({
      next: (data) => this.contas = data,
      error: (err) => this.mostrarErro('Erro ao carregar contas disponíveis')
    });
  }

  carregarDados(event?: any): void {
    this.loading = true;
    const params = {
      page: event?.first ? Math.floor(event.first / event.rows) + 1 : 1,
      size: event?.rows || 10,
      ...this.filtros,
      sortField: event?.sortField || 'dataPrevista',
      sortOrder: event?.sortOrder === 1 ? 'asc' : 'desc'
    };

    this.contasService.listarContasReceber(params).subscribe({
      next: (response: any) => {
        this.itens = response.items || [];
        this.totalRecords = response.total || 0;
        this.resumo = this.calculaResumo(response.items || []);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.mostrarErro('Erro ao carregar dados');
        this.loading = false;
      }
    });
  }

  calculaResumo(items: ContaReceberResponseModel[]) {
    let pendentes = 0, pagas = 0, vencidas = 0, valorTotal = 0;
    const hoje = new Date();
    for (const item of items) {
      valorTotal += item.valor ?? 0;
      if (item.status === 'Pendente') {
        const dataVenc = item.dataPrevista ? new Date(item.dataPrevista) : null;
        if (dataVenc && dataVenc < hoje) vencidas++;
        else pendentes++;
      } else if (item.status === 'Recebido') {
        pagas++;
      }
    }
    return { pendentes, pagas, vencidas, valorTotal };
  }

  aplicarFiltros(): void {
    clearTimeout(this.filtroTimeout);
    this.filtroTimeout = setTimeout(() => {
      if (this.table) {
        this.table.reset();
        this.table.first = 0;
      }
      this.carregarDados();
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
    // Passamos o 'payload' com a data formatada para o serviço.
    this.contasService.editarContaReceber(this.contaEditando.id || 0, payload).subscribe({
      next: (response) => {
        console.log('Conta atualizada com sucesso:', response);
        this.dialogVisible = false;
        this.carregarDados();
        this.mostrarSucesso('Conta atualizada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar conta:', err);
        this.mostrarErro('Erro ao atualizar conta: ' + (err.error?.detail || err.message || 'Erro desconhecido'));
      }
    });
  } else {
    // Passamos o 'payload' com a data formatada para o serviço.
    this.contasService.cadastrarContaReceber(payload).subscribe({
      next: (response) => {
        console.log('Conta cadastrada com sucesso:', response);
        this.dialogVisible = false;
        this.carregarDados();
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
      accept: () => {
        this.contasService.deletarContaReceber(id).subscribe({
          next: () => {
            this.carregarDados();
            this.mostrarSucesso('Conta excluída com sucesso!');
          },
          error: () => this.mostrarErro('Erro ao excluir conta')
        });
      }
    });
  }

  toggleStatus(item: ContaReceberResponseModel, event: Event): void {
    event.stopPropagation();
    if (item.status === 'Recebido') {
      this.mostrarAviso('Esta conta já foi confirmada como paga');
      return;
    }
    const mensagem = item.status === 'Pendente' ? 'Confirmar recebimento desta conta?' : 'Reverter para pendente?';
    this.confirmationService.confirm({
      message: mensagem,
      header: 'Confirmar Ação',
      icon: 'pi pi-question-circle',
      accept: () => this.confirmarRecebimento(item)
    });
  }

  confirmarRecebimento(item: ContaReceberResponseModel): void {
    this.contasService.confirmarRecebimento(item.id).subscribe({
      next: () => {
        this.carregarDados();
        this.mostrarSucesso('Recebimento confirmado com sucesso!');
      },
      error: (err: any) => this.mostrarErro('Erro ao confirmar recebimento')
    });
  }

  exportarDados() {
    this.contasService.exportarContasReceber(this.filtros).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contas-receber-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.mostrarSucesso('Arquivo exportado com sucesso!');
      },
      error: (err) => this.mostrarErro('Erro ao exportar dados')
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

  isVencida(item: ContaReceberResponseModel): boolean {
    if (item.status === 'Recebido') return false;
    const hoje = new Date();
    const dataVenc = item.dataPrevista ? new Date(item.dataPrevista) : null;
        if (dataVenc && dataVenc < hoje) return true;
    return false;
  }

  verDetalhes(item: ContaReceberResponseModel): void {
    // Modal informativo, conforme design desejado
    this.mostrarAviso('Visualização de detalhes ainda não implementada.');
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