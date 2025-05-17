import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ReceitasService } from '../../../service/receitas.service';
import { DespesasService } from '../../../service/despesas.service';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-pesquisar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    FooterComponent,
    NavBarSystemComponent,
    SplitterModule,
    TabMenuModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    CalendarModule,
    ConfirmDialogModule,
    ToastModule,

  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pesquisar.component.html',
  styleUrls: ['./pesquisar.component.css']
})
export class PesquisarComponent implements OnInit {
  constructor(
  private http: HttpClient,
  private receitasService: ReceitasService,
  private despesasService: DespesasService,
  private confirmationService: ConfirmationService,
  private messageService: MessageService,
) {}

  categoriaDaReceita = [
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

  categoriaDaDespesa = [
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

  editarReceitaModalVisible = false;
  receitaSelecionada: any = null;

  receitas: any[] = [];
  despesas: any[] = [];

  filteredReceitas: any[] = [];
  filteredDespesas: any[] = [];

  filters = {
  categoria: [] as { name: string }[],
  desc: '',
  conta: '',
  data: '',
  valor: '',
  forma_pag: '',
  forma_receb:'',
  };

  itemEditando: any = undefined;
  modalEdicaoVisivel: boolean = false;
  isEditandoReceita: boolean = false;

  first = 0;
  rows = 10;

  tabItems: MenuItem[] = [
    { label: 'Receitas', icon: 'pi pi-dollar' },
    { label: 'Despesas', icon: 'pi pi-credit-card' }
  ];

  activeTab: MenuItem = this.tabItems[0];

  ngOnInit(): void {
    this.onTabChange(this.activeTab);
  }
  
  onFilterChange() {
    const categoriasSelecionadas = this.filters.categoria.map((c: any) => c.name);
  
    if (this.activeTab.label === 'Receitas') {
      this.filteredReceitas = this.receitas.filter(item =>
        (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
        item.nome_receita.toLowerCase().includes(this.filters.desc.toLowerCase()) &&
        (this.filters.conta === '' || item.conta.conta_id === +this.filters.conta) &&
        (this.filters.data === '' || item.data_recebimento === this.filters.data) &&
        (this.filters.valor ==='' || item.valor === this.filters.valor) &&
        (this.filters.forma_receb === '' || item.forma_receb === this.filters.forma_receb)
      );
    }
  
    if (this.activeTab.label === 'Despesas') {
      this.filteredDespesas = this.despesas.filter(item =>
        (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
        item.nome_despesa.toLowerCase().includes(this.filters.desc.toLowerCase()) &&
        (this.filters.conta === '' || item.conta.conta_id === +this.filters.conta) &&
        (this.filters.data === '' || item.data_pagamento === this.filters.data) &&
        (this.filters.valor === '' || item.valor === this.filters.valor) &&
        (this.filters.forma_pag === '' || item.forma_pag === this.filters.forma_pag)
      );    
    }
  
    this.first = 0;
  }
  
  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  
  onTabChange(item: MenuItem) {
    this.activeTab = item;

    if (item.label === 'Receitas') {
      this.receitasService.getReceitas().subscribe({
        next: (data) => {
          this.receitas = data;
          this.filteredReceitas = [...data];
        },
        error: (err) => console.error('Erro ao carregar receitas:', err)
      });
    }

    if (item.label === 'Despesas') {
      this.despesasService.getDespesas().subscribe({
        next: (data) => {
          this.despesas = data;
          this.filteredDespesas = [...data];
        },
        error: (err) => console.error('Erro ao carregar despesas:', err)
      });
    }
  }
  
  
  apagarItem(index: number): void {
  const isReceita = this.activeTab.label === 'Receitas';
  const item = isReceita ? this.filteredReceitas[index] : this.filteredDespesas[index];
  const tipo = isReceita ? 'receita' : 'despesa';

  this.confirmationService.confirm({
    message: `Tem certeza que deseja apagar esta ${tipo}?`,
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sim',
    rejectLabel: 'Cancelar',
    accept: () => {
      const observable = isReceita
        ? this.receitasService.deletarReceita(item.id)
        : this.despesasService.deletarDespesa(item.id);

      observable.subscribe({
        next: () => {
          if (isReceita) {
            this.receitas = this.receitas.filter(i => i.id !== item.id);
          } else {
            this.despesas = this.despesas.filter(i => i.id !== item.id);
          }
          this.onFilterChange();

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `${isReceita ? 'Receita' : 'Despesa'} apagada com sucesso`
          });
        },
        error: (err) => {
          console.error(`Erro ao apagar ${tipo}:`, err);
        }
      });
    }
  });
  }


  editarItem(index: number): void {
  const isReceita = this.activeTab.label === 'Receitas';
  const itemOriginal = isReceita ? this.filteredReceitas[index] : this.filteredDespesas[index];

  this.itemEditando = itemOriginal ? { ...itemOriginal } : { descricao: '' };
  this.isEditandoReceita = isReceita;
  this.modalEdicaoVisivel = true;
}


  confirmarEdicao(): void {
  const item = this.itemEditando;
  const isReceita = this.isEditandoReceita;

  // Formata a data para 'yyyy-MM-dd' se for Date, ou usa string direto
  let dataFormatada: string | null = null;
  if (item.data) {
    if (item.data instanceof Date) {
      dataFormatada = item.data.toISOString().split('T')[0];
    } else {
      dataFormatada = item.data; // supondo que já seja string no formato correto
    }
  }

  const payload = {
    categoria: item.categoria,
    descricao: item.descricao,
    conta_id: item.conta_id,
    valor_recebido: isReceita ? item.valor : undefined,
    valor_pago: !isReceita ? item.valor : undefined,
    data_recebimento: isReceita ? dataFormatada : undefined,
    data_pagamento: !isReceita ? dataFormatada : undefined,
    forma_recebimento: isReceita ? item.forma_recebimento : undefined,
    forma_pagamento: !isReceita ? item.forma_pagamento : undefined
  };

  const observable = isReceita
    ? this.receitasService.editarReceita(item.id, payload)
    : this.despesasService.editarDespesa(item.id, payload);

  observable.subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `${isReceita ? 'Receita' : 'Despesa'} editada com sucesso`
      });
      this.modalEdicaoVisivel = false;
      this.recarregarDados(); // Atualiza a lista de receitas/despesas
    },
    error: (err) => {
      console.error('Erro ao editar:', err);
    }
  });
}


recarregarDados(): void {
  if (this.activeTab.label === 'Receitas') {
    this.receitasService.getReceitas().subscribe({
      next: (data) => {
        this.receitas = data;
        this.filteredReceitas = [...data];
        this.onFilterChange(); // Caso queira re-aplicar filtros após recarregar
      },
      error: (err) => console.error('Erro ao carregar receitas:', err)
    });
  } else if (this.activeTab.label === 'Despesas') {
    this.despesasService.getDespesas().subscribe({
      next: (data) => {
        this.despesas = data;
        this.filteredDespesas = [...data];
        this.onFilterChange();
      },
      error: (err) => console.error('Erro ao carregar despesas:', err)
    });
  }
}




}
