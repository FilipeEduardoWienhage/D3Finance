import { Component, OnInit } from '@angular/core';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TransacaoService } from '../../../service/transacao.service';
import { ContasService } from '../../../service/contas.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-visao-geral',
  imports:
    [
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
      FormsModule,
      CardModule
    ],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.css',
  providers: [MessageService, ConfirmationService]
})

export class VisaoGeralComponent implements OnInit {
  constructor(
    private receitasService: ReceitasService,
    private despesasService: DespesasService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private transacaoService: TransacaoService,
    private contasService: ContasService
  ) { }

  tipoContas = [
    { name: 'Pessoal' },
    { name: 'Empresa' },
    { name: 'Despesas' },
  ];

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

  editDialogVisible = false;
  receitaSelecionada: any = null;

  receitas: any[] = [];
  despesas: any[] = [];
  transacoes: any[] = [];
  contas: any[] = [];



  filteredReceitas: any[] = [];
  filteredDespesas: any[] = [];
  filteredTransacoes: any[] = [];
  filteredContas: any[] = [];

  filters = {
    tipoConta: [] as { name: string }[],
    categoria: [] as { name: string }[],
    desc: '',
    conta: '',
    data: '',
    valor: '',
    forma_pagamento: '',
    forma_recebimento: '',
  };


  first = 0;
  rows = 10;

  tabItems: MenuItem[] = [
    { label: 'Contas e Saldo', icon: 'pi pi-wallet' },
    { label: 'Receitas', icon: 'pi pi-dollar' },
    { label: 'Despesas', icon: 'pi pi-credit-card' },
    { label: 'Transações', icon: 'pi pi-arrow-right-arrow-left' }
  ];

  activeTab: MenuItem = this.tabItems[0];

  ngOnInit(): void {
    this.onTabChange(this.activeTab);
  }

  onFilterChange() {
    const categoriasSelecionadas = this.filters.categoria.map((c: any) => c.name);
    const tiposSelecionados = this.filters.tipoConta.map((t: any) => t.name.toLowerCase());

    if (this.activeTab.label === 'Receitas') {
      this.filteredReceitas = this.receitas.filter(item => {
        return (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
          (item.descricao.toLowerCase().includes(this.filters.desc.toLowerCase())) &&
          (this.filters.conta === '' || item.conta_nome.toLowerCase().includes(this.filters.conta.toLowerCase())) &&
          (this.filters.data === '' || item.data === this.filters.data) &&
          (this.filters.forma_recebimento === '' || item.forma_recebimento === this.filters.forma_recebimento);
      });
    }

    if (this.activeTab.label === 'Contas e Saldo') {
      this.filteredContas = this.contas.filter(item => {
        const tipoConta = item.tipo?.toLowerCase();
        const tipoValido = tiposSelecionados.length === 0 || tiposSelecionados.includes(item.tipo_conta?.toLowerCase());
        const nomeValido = item.nome_conta?.toLowerCase().includes(this.filters.conta.toLowerCase());
        return tipoValido && nomeValido;
      });
    }

    if (this.activeTab.label === 'Despesas') {
      this.filteredDespesas = this.despesas.filter(item => {
        return (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
          (item.descricao.toLowerCase().includes(this.filters.desc.toLowerCase())) &&
          (this.filters.conta === '' || item.conta_nome.toLowerCase().includes(this.filters.conta.toLowerCase())) &&
          (this.filters.data === '' || item.data === this.filters.data) &&
          (this.filters.forma_pagamento === '' || item.forma_pagamento === this.filters.forma_pagamento);
      });
    }

    if (this.activeTab.label === 'Transações') {
      this.filteredTransacoes = this.transacoes.filter(item =>
        (this.filters.conta === '' ||
          item.conta_origem_nome?.toLowerCase().includes(this.filters.conta.toLowerCase()) ||
          item.conta_destino_nome?.toLowerCase().includes(this.filters.conta.toLowerCase())) &&
        (this.filters.data === '' || item.data_transacao === this.filters.data) &&
        (this.filters.valor === '' || item.valor === +this.filters.valor)
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
          this.receitas = data.map(receita => {
            const conta = this.contas.find(c => c.id === receita.conta_id);
            return {
              ...receita,
              conta_nome: conta?.nome_conta || 'Desconhecida'
            };
          });
          this.filteredReceitas = [...this.receitas];
        },
        error: (err) => console.error('Erro ao carregar receitas:', err)
      });
    }

    if (item.label === 'Despesas') {
      this.despesasService.getDespesas().subscribe({
        next: (data) => {
          this.despesas = data.map(despesa => {
            const conta = this.contas.find(c => c.id === despesa.conta_id);
            return {
              ...despesa,
              conta_nome: conta?.nome_conta || 'Desconhecida'
            };
          });

          this.filteredDespesas = [...this.despesas];
        },
        error: (err) => console.error('Erro ao carregar despesas:', err)
      });
    }


    if (item.label === 'Transações') {
      this.transacaoService.getTransacoes().subscribe({
        next: (data) => {
          console.log(item)
          this.transacoes = data.map(item => {
            const origemId = Number(item.conta_origem_id);
            const destinoId = Number(item.conta_destino_id);

            const contaOrigem = this.contas.find(c => Number(c.id) === origemId);
            const contaDestino = this.contas.find(c => Number(c.id) === destinoId);

            return {
              ...item,
              conta_origem_nome: contaOrigem?.nome_conta || 'Desconhecida',
              conta_destino_nome: contaDestino?.nome_conta || 'Desconhecida'
            };
          });

          console.log('Transações enriquecidas:', this.transacoes);
          this.filteredTransacoes = [...this.transacoes];
        },
        error: (err) => console.error('Erro ao carregar transações:', err)
      });
    }

    if (item.label === 'Contas e Saldo') {
      this.contasService.getContas().subscribe({
        next: (data) => {
          console.log(item)
          this.contas = data;
          this.filteredContas = [...data];
        },
        error: (err) => {
          console.error('Erro ao buscar contas:', err);
        }
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
        const deleteObservable = isReceita
          ? this.receitasService.deletarReceita(item.id)
          : this.despesasService.deletarDespesa(item.id);

        deleteObservable.subscribe({
          next: () => {
            if (isReceita) {
              this.receitas = this.receitas.filter(r => r.id !== item.id);
              this.filteredReceitas = this.filteredReceitas.filter(r => r.id !== item.id);
            } else {
              this.despesas = this.despesas.filter(d => d.id !== item.id);
              this.filteredDespesas = this.filteredDespesas.filter(d => d.id !== item.id);
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `${isReceita ? 'Receita' : 'Despesa'} apagada com sucesso`
            });
          },
          error: (err) => {
            console.error(`Erro ao apagar ${tipo}:`, err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Erro ao apagar ${tipo}.`
            });
          }
        });
      }
    });
  }

  abrirEdicao(receita: any) {
    this.receitaSelecionada = { ...receita }; // faz cópia
    this.editDialogVisible = true;
  }

  fecharDialog() {
    this.editDialogVisible = false;
    this.receitaSelecionada = null;
  }


  carregarReceitas() {
    this.receitasService.getReceitas().subscribe((receitas) => {
      this.receitas = receitas;
    });
  }


  salvarEdicao() {
    if (this.receitaSelecionada && this.receitaSelecionada.id) {
      this.receitasService.atualizarReceita(this.receitaSelecionada.id, this.receitaSelecionada)
        .subscribe({
          next: () => {
            console.log('Receita atualizada com sucesso');
            this.fecharDialog(); // ou outra forma de fechar modal
            this.carregarReceitas();   // recarrega a lista
          },
          error: (err) => {
            console.error('Erro ao atualizar receita:', err);
          }
        });
    }
  }

}
