import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ReceitasService } from '../../../service/receitas.service';
import { DespesasService } from '../../../service/despesas.service';
import { TransacaoService } from '../../../service/transacao.service';
import { ContasService } from '../../../service/contas.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { PrimeNG } from 'primeng/config';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-visao-geral',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    SplitterModule,
    TabMenuModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    CalendarModule,
    DatePicker,

    ConfirmDialogModule,
    ToastModule,
    CardModule,
    NavBarSystemComponent,
    FooterComponent,
    InputNumberModule,

  ],
  templateUrl: './visao-geral.component.html',
  styleUrls: ['./visao-geral.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class VisaoGeralComponent implements OnInit {

  constructor(
    private receitasService: ReceitasService,
    private despesasService: DespesasService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private transacaoService: TransacaoService,
    private contasService: ContasService,
    private primengConfig: PrimeNG
  ) { }

  tipoContas = [
    { name: 'Despesas' },
    { name: 'Empresa' },
    { name: 'Pessoal' },
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

  categoriaDaDespesa = [
    { name: 'Despesas Administrativas' },
    { name: 'Despesas Financeiras' },
    { name: 'Despesas Operacionais' },
    { name: 'Despesas com Marketing' },
    { name: 'Despesas com Materiais' },
    { name: 'Despesas com Pessoal' },
    { name: 'Despesas com Terceirizados' },
    { name: 'Despesas com Transporte' },
    { name: 'Impostos e Taxas' },
    { name: 'Manutenção e Reparos' },
    { name: 'Outras Despesas' }
  ];

  formasPags = [
    { name: 'Cheque' },
    { name: 'Crédito' },
    { name: 'Depósito' },
    { name: 'Dinheiro' },
    { name: 'Débito' },
    { name: 'Pix' }
  ];

  formasPagsComTodas: { name: string }[] = [];

  editDialogVisible = false;
  itemEmEdicao: any = null;
  tipoItemEmEdicao: 'conta' | 'receita' | 'despesa' | '' = '';
  tituloModal = 'Editar Item';

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
    data: null as Date | null,
    valor: null as string | number | null,
    forma_pagamento: null as string | null,
    forma_recebimento: null as string | null,
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

    this.formasPagsComTodas = [{ name: 'Todas' }, ...this.formasPags];

    this.contasService.getContas().subscribe({
      next: (data) => {
        // Ordenar contas alfabeticamente por nome
        this.contas = data.sort((a, b) => a.nome_conta.localeCompare(b.nome_conta));
        this.filteredContas = [...this.contas];
        this.onTabChange(this.activeTab);  // Agora que contas estão carregadas, carregar o resto
      },
      error: (err) => console.error('Erro ao buscar contas:', err)
    });
    this.onTabChange(this.activeTab);

    this.primengConfig.setTranslation({
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['D','S','T','Q','Q','S','S'],
    monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Sm',
    firstDayOfWeek: 0,
  });
  }


  onFilterChange() {
    const categoriasSelecionadas = this.filters.categoria.map((c: any) => c.name);
    const tiposSelecionados = this.filters.tipoConta.map((t: any) => t.name.toLowerCase());

    const formaPagamentoSelecionada = this.filters.forma_pagamento;
    const formaRecebimentoSelecionada = this.filters.forma_recebimento;

    if (this.activeTab.label === 'Receitas') {
      this.filteredReceitas = this.receitas.filter(item => {
        let filtroData = '';
        if (this.filters.data) {
          try {
            const dataFiltro = typeof this.filters.data === 'string' 
              ? new Date(this.filters.data) 
              : this.filters.data;
            
            if (!isNaN(dataFiltro.getTime())) {
              filtroData = dataFiltro.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Erro ao converter data do filtro:', e);
          }
        }

        let itemData = '';
        if (item.data_recebimento) {
          try {
            const dataItem = new Date(item.data_recebimento);
            if (!isNaN(dataItem.getTime())) {
              itemData = dataItem.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Erro ao converter data do item:', e);
          }
        }

        const filtroFormaRecebimento = !formaRecebimentoSelecionada || formaRecebimentoSelecionada === 'Todas' || item.forma_recebimento === formaRecebimentoSelecionada;

        return (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
          (item.descricao.toLowerCase().includes(this.filters.desc.toLowerCase())) &&
          (this.filters.conta === '' || item.conta_nome.toLowerCase().includes(this.filters.conta.toLowerCase())) &&
          (filtroData === '' || itemData === filtroData) &&
          filtroFormaRecebimento;
      }).sort((a, b) => {
        // Manter ordenação por data de recebimento (mais recente primeiro)
        const dataA = new Date(a.data_recebimento);
        const dataB = new Date(b.data_recebimento);
        return dataB.getTime() - dataA.getTime();
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
        let filtroData = '';
        if (this.filters.data) {
          try {
            const dataFiltro = typeof this.filters.data === 'string' 
              ? new Date(this.filters.data) 
              : this.filters.data;
            
            if (!isNaN(dataFiltro.getTime())) {
              filtroData = dataFiltro.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Erro ao converter data do filtro:', e);
          }
        }

        let itemData = '';
        if (item.data_pagamento) {
          try {
            const dataItem = new Date(item.data_pagamento);
            if (!isNaN(dataItem.getTime())) {
              itemData = dataItem.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Erro ao converter data do item:', e);
          }
        }
        
        const filtroFormaPagamento = !formaPagamentoSelecionada || formaPagamentoSelecionada === 'Todas' || item.forma_pagamento === formaPagamentoSelecionada;

        return (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(item.categoria)) &&
          (item.descricao.toLowerCase().includes(this.filters.desc.toLowerCase())) &&
          (this.filters.conta === '' || item.conta_nome.toLowerCase().includes(this.filters.conta.toLowerCase())) &&
          (filtroData === '' || itemData === filtroData) &&
          filtroFormaPagamento; 
      }).sort((a, b) => {
        // Manter ordenação por data de pagamento (mais recente primeiro)
        const dataA = new Date(a.data_pagamento);
        const dataB = new Date(b.data_pagamento);
        return dataB.getTime() - dataA.getTime();
      });
    }

    if (this.activeTab.label === 'Transações') {
      this.filteredTransacoes = this.transacoes.filter(item => {
        let filtroData = '';
        if (this.filters.data) {
          try {
            const dataFiltro = typeof this.filters.data === 'string' 
              ? new Date(this.filters.data) 
              : this.filters.data;
            
            if (!isNaN(dataFiltro.getTime())) {
              filtroData = dataFiltro.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Erro ao converter data do filtro:', e);
          }
        }

        let itemData = '';
        if (item.data_transacao) {
          try {
            const dataItem = new Date(item.data_transacao);
            if (!isNaN(dataItem.getTime())) {
              itemData = dataItem.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Erro ao converter data do item:', e);
          }
        }

        // Tratar filtro de valor (pode ser string formatada como moeda ou número)
        let valorFiltro = null;
        if (this.filters.valor !== '' && this.filters.valor !== null) {
          if (typeof this.filters.valor === 'string') {
            // Remover formatação de moeda (R$, pontos, vírgulas)
            const valorLimpo = this.filters.valor.replace(/[R$\s.]/g, '').replace(',', '.');
            valorFiltro = parseFloat(valorLimpo);
          } else {
            valorFiltro = this.filters.valor;
          }
        }

        return (this.filters.conta === '' ||
          item.conta_origem_nome?.toLowerCase().includes(this.filters.conta.toLowerCase()) ||
          item.conta_destino_nome?.toLowerCase().includes(this.filters.conta.toLowerCase())) &&
          (filtroData === '' || itemData === filtroData) &&
          (valorFiltro === null || item.valor === valorFiltro);
      }).sort((a, b) => {
        // Manter ordenação por data de transação (mais recente primeiro)
        const dataA = new Date(a.data_transacao);
        const dataB = new Date(b.data_transacao);
        return dataB.getTime() - dataA.getTime();
      });
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
          }).sort((a, b) => {
            // Ordenar por data de recebimento (mais recente primeiro)
            const dataA = new Date(a.data_recebimento);
            const dataB = new Date(b.data_recebimento);
            return dataB.getTime() - dataA.getTime();
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
          }).sort((a, b) => {
            // Ordenar por data de pagamento (mais recente primeiro)
            const dataA = new Date(a.data_pagamento);
            const dataB = new Date(b.data_pagamento);
            return dataB.getTime() - dataA.getTime();
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
          }).sort((a, b) => {
            // Ordenar por data de transação (mais recente primeiro)
            const dataA = new Date(a.data_transacao);
            const dataB = new Date(b.data_transacao);
            return dataB.getTime() - dataA.getTime();
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
    const abaAtiva = this.activeTab.label;
    let item: any;
    let tipo: string;
    let deleteObservable;

    // Identificar item, tipo e serviço de exclusão com base na aba ativa
    switch (abaAtiva) {
      case 'Receitas':
        item = this.filteredReceitas[index];
        tipo = 'receita';
        deleteObservable = this.receitasService.deletarReceita(item.id);
        break;
      case 'Despesas':
        item = this.filteredDespesas[index];
        tipo = 'despesa';
        deleteObservable = this.despesasService.deletarDespesa(item.id);
        break;
      case 'Contas e Saldo':
        item = this.filteredContas[index];
        tipo = 'conta';

        const receitasComConta = this.receitas.filter(r => r.contaId === item.id);
        if (receitasComConta.length > 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Conta vinculada',
            detail: 'Esta conta possui receitas associadas. Exclua-as antes de apagar a conta.'
          });
          return;
        }

        deleteObservable = this.contasService.deletarConta(item.id);
        break;
      default:
        console.error('Tipo de aba desconhecido:', abaAtiva);
        return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja apagar esta ${tipo}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => {
        deleteObservable.subscribe({
          next: () => {
            switch (tipo) {
              case 'receita':
                this.receitas = this.receitas.filter(r => r.id !== item.id);
                this.filteredReceitas = this.filteredReceitas.filter(r => r.id !== item.id);
                break;
              case 'despesa':
                this.despesas = this.despesas.filter(d => d.id !== item.id);
                this.filteredDespesas = this.filteredDespesas.filter(d => d.id !== item.id);
                break;
              case 'conta':
                this.contas = this.contas.filter(c => c.id !== item.id);
                this.filteredContas = this.filteredContas.filter(c => c.id !== item.id);
                break;
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} apagada com sucesso`
            });
          },
          error: (err) => {
            console.error(`Erro ao apagar ${tipo}:`, err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Esta ${tipo} possui receitas ou despesas associadas. Exclua-as antes de apagar a conta.`
            });
          }
        });
      }
    });
  }


  abrirEdicao(item: any): void {
    const aba = this.activeTab.label;

    this.itemEmEdicao = { ...item };
    if (aba === 'Contas e Saldo') {
      this.tipoItemEmEdicao = 'conta';
      this.tituloModal = 'Editar Conta';
    } else if (aba === 'Receitas') {
      this.tipoItemEmEdicao = 'receita';
      this.tituloModal = 'Editar Receita';
      // Garantir que o conta_id está configurado corretamente
      if (this.itemEmEdicao.conta_id) {
        const contaSelecionada = this.contas.find(c => c.id === this.itemEmEdicao.conta_id);
        if (contaSelecionada) {
          this.itemEmEdicao.conta_nome = contaSelecionada.nome_conta;
        }
      }
    } else if (aba === 'Despesas') {
      this.tipoItemEmEdicao = 'despesa';
      this.tituloModal = 'Editar Despesa';
      // Garantir que o conta_id está configurado corretamente
      if (this.itemEmEdicao.conta_id) {
        const contaSelecionada = this.contas.find(c => c.id === this.itemEmEdicao.conta_id);
        if (contaSelecionada) {
          this.itemEmEdicao.conta_nome = contaSelecionada.nome_conta;
        }
      }
    } else {
      this.tipoItemEmEdicao = '';
      this.tituloModal = 'Editar Item';
    }

    this.editDialogVisible = true;
  }


  salvarEdicao(): void {
    if (!this.itemEmEdicao) return;

    let saveObservable;

    switch (this.tipoItemEmEdicao) {
      case 'conta':
        saveObservable = this.contasService.editarConta(this.itemEmEdicao);
        break;
      case 'receita':
        saveObservable = this.receitasService.editarReceita(this.itemEmEdicao);
        break;
      case 'despesa':
        saveObservable = this.despesasService.editarDespesa(this.itemEmEdicao);
        break;
      default:
        return;
    }


    saveObservable.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Item atualizado com sucesso!'
        });
        this.onTabChange(this.activeTab);
        this.fecharModalEdicao();
      },
      error: err => {
        console.error('Erro ao editar item:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível atualizar o item.'
        });
      }
    });
  }

  fecharModalEdicao(): void {
    this.editDialogVisible = false;
    this.itemEmEdicao = null;
    this.tipoItemEmEdicao = null!;
    this.tituloModal = 'Editar Item';
  }

  onContaChange(): void {
    if (!this.itemEmEdicao) return;

    // Se for receita, atualizar o nome da conta
    if (this.tipoItemEmEdicao === 'receita') {
      const contaSelecionada = this.contas.find(c => c.id === this.itemEmEdicao.conta_id);
      if (contaSelecionada) {
        this.itemEmEdicao.conta_nome = contaSelecionada.nome_conta;
      }
    }

    // Se for despesa, atualizar o nome da conta
    if (this.tipoItemEmEdicao === 'despesa') {
      const contaSelecionada = this.contas.find(c => c.id === this.itemEmEdicao.conta_id);
      if (contaSelecionada) {
        this.itemEmEdicao.conta_nome = contaSelecionada.nome_conta;
      }
    }
  }
}


