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
  ],
  providers: [MessageService],
  templateUrl: './pesquisar.component.html',
  styleUrls: ['./pesquisar.component.css']
})
export class PesquisarComponent implements OnInit {
  constructor(
    private http: HttpClient,
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
  data: ''
  };

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
        (this.filters.data === '' || item.data_recebimento === this.filters.data)
      );
    }
  
    if (this.activeTab.label === 'Despesas') {
      this.filteredDespesas = this.despesas.filter(item =>
        (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
        item.nome_despesa.toLowerCase().includes(this.filters.desc.toLowerCase()) &&
        (this.filters.conta === '' || item.conta.conta_id === +this.filters.conta) &&
        (this.filters.data === '' || item.data_pagamento === this.filters.data)
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
      this.http.get<any[]>('http://localhost:8000/v1/receitas').subscribe({
        next: (data) => {
          this.receitas = data;
          this.filteredReceitas = [...data];
        },
        error: (err) => console.error('Erro ao carregar receitas:', err)
      });
    }
  
    if (item.label === 'Despesas') {
      this.http.get<any[]>('http://localhost:8000/v1/despesas').subscribe({
        next: (data) => {
          this.despesas = data;
          this.filteredDespesas = [...data];
        },
        error: (err) => console.error('Erro ao carregar despesas:', err)
      });
    }
  }
  

  editarItem(index: number) {
    const item = this.filteredReceitas[index];
    this.receitaSelecionada = { ...item };
    this.editarReceitaModalVisible = true;
  }
  
  apagarItem(index: number): void {
    const isReceita = this.activeTab.label === 'Receitas';
    const item = isReceita ? this.filteredReceitas[index] : this.filteredDespesas[index];
    const tipo = isReceita ? 'receitas' : 'despesas';
  
    this.http.delete(`http://localhost:8000/v1/${tipo}/${item.id}`).subscribe({
      next: () => {
        if (isReceita) {
          this.receitas = this.receitas.filter(i => i.id !== item.id);
        } else {
          this.despesas = this.despesas.filter(i => i.id !== item.id);
        }
        this.onFilterChange();
      },
      error: (err) => {
        console.error(`Erro ao apagar ${tipo.slice(0, -1)}:`, err);
      }
    });
  }

  salvarEdicaoReceita() {
    const receitaAtualizada = {
      ...this.receitaSelecionada,
      data_recebimento: this.formatarData(this.receitaSelecionada.data_recebimento)
    };
  
    this.http.put(`http://localhost:8000/v1/receitas/${receitaAtualizada.id}`, receitaAtualizada)
      .subscribe({
        next: () => {
          this.editarReceitaModalVisible = false;
          this.onTabChange(this.activeTab);  // Atualiza os dados
        },
        error: err => {
          console.error('Erro ao salvar edição:', err);
        }
      });
  }
 
  formatarData(data: any): string {
    const d = new Date(data);
    return d.toISOString().split('T')[0];  // Formato 'YYYY-MM-DD'
  }
}
