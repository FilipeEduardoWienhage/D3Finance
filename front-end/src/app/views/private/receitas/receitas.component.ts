import { ChangeDetectorRef, Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ReceitasService } from '../../../service/receitas.service';
import { ReceitaConsolidada } from '../../../models/receita-consolidada';
import { ReceitaMensal } from '../../../models/receita-mensal';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ContasService } from '../../../service/contas.service';


@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [
    ChartModule,
    FooterComponent,
    NavBarSystemComponent,
    SplitterModule,
    CardModule,
    FormsModule,
    CalendarModule,
    ButtonModule,
    ToastModule,
    DropdownModule,
    InputTextModule
  ],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css'],
  providers: [MessageService, ReceitasService, ContasService]
})
export class ReceitasComponent implements OnInit {
  dadosConsolidado: ReceitaConsolidada[] = [];
  dataConsolidado: any;
  optionsConsolidado: any;

  dadosMensal: ReceitaMensal[] = [];
  dataMensal: any;
  optionsMensal: any;

  filtroConsolidado = {
    dataSelecionada: null as Date | null,
    conta_id: null as number | null,
    forma_recebimento: null as string | null
  };

  filtroMensal = {
    categoria: null as string | null,
    ano: new Date().getFullYear(),
    conta_id: null as number | null,
    forma_recebimento: null as string | null
  };

  contasOpcoes = [
    { label: 'Todas as Contas', value: null }
  ];

  categoriasOpcoes = [
    { label: 'Todas as Categorias', value: null },
    { label: 'Multas Contratuais Recebidas', value: 'Multas Contratuais Recebidas' },
    { label: 'Outras Receitas Não Operacionais', value: 'Outras Receitas Não Operacionais' },
    { label: 'Outras Receitas Operacionais', value: 'Outras Receitas Operacionais' },
    { label: 'Prestação de Serviços', value: 'Prestação de Serviços' },
    { label: 'Recebimento de Contratos', value: 'Recebimento de Contratos' },
    { label: 'Receita com Publicidade / Parcerias', value: 'Receita com Publicidade / Parcerias' },
    { label: 'Receitas de Aluguel de Bens', value: 'Receitas de Aluguel de Bens' },
    { label: 'Receitas de Assinaturas / Mensalidades', value: 'Receitas de Assinaturas / Mensalidades' },
    { label: 'Receitas de Consultoria', value: 'Receitas de Consultoria' },
    { label: 'Receitas de Licenciamento', value: 'Receitas de Licenciamento' },
    { label: 'Recuperação de Crédito / Cobrança', value: 'Recuperação de Crédito / Cobrança' },
    { label: 'Reembolso de Custos Operacionais', value: 'Reembolso de Custos Operacionais' },
    { label: 'Rendimentos de Investimentos', value: 'Rendimentos de Investimentos' },
    { label: 'Royalties Recebidos', value: 'Royalties Recebidos' },
    { label: 'Venda de Produtos', value: 'Venda de Produtos' }
  ];

  formasRecebimentoOpcoes = [
    { label: 'Todas as Formas', value: null },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Crédito', value: 'credito' },
    { label: 'Débito', value: 'debito' },
    { label: 'Depósito', value: 'deposito' },
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Pix', value: 'pix' }
  ]

  statusReceitaOpcoes = [
    { label: 'Todos os Status', value: null },
    { label: 'Recebido', value: 'recebido' },
    { label: 'Pendente', value: 'pendente' },
    { label: 'Atrasado', value: 'atrasado' }
  ];

  platformId = inject(PLATFORM_ID);

  constructor(
    private cd: ChangeDetectorRef,
    private receitaService: ReceitasService,
    private messageService: MessageService,
    private contasService: ContasService
  ) { }

  ngOnInit() {
    this.carregarContas();
    this.carregarDadosDoGrafico();
    this.carregarDadosMensais();
  }

  carregarContas() {
    this.contasService.getContas().subscribe({
      next: (contas) => {
        console.log('Contas carregadas:', contas);
        this.contasOpcoes = [
          { label: 'Todas as Contas', value: null },
          ...contas.map(conta => ({
            label: conta.nome_conta,
            value: conta.id
          }))
        ];
        console.log('Opções de contas:', this.contasOpcoes);
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar as contas.'
        });
      }
    });
  }

  carregarDadosMensais() {
    const filtrosParaApi = {
      ano: this.filtroMensal.ano,
      categoria: this.filtroMensal.categoria,
      conta_id: this.filtroMensal.conta_id,
      forma_recebimento: this.filtroMensal.forma_recebimento
    };
    this.receitaService.getReceitasConsolidadasMensal(filtrosParaApi).subscribe({
      next: (dados) => {
        if (this.filtroMensal.categoria && dados.every(d => d.valor === 0)) {
          this.messageService.add({
            severity: 'info',
            summary: 'Aviso',
            detail: 'Não há receitas para esta categoria no ano selecionado.'
          });
        } else {
          this.dadosMensal = dados;
          this.initChartMensal();
        }
      },
      error: (err) => console.error('Erro ao carregar dados mensais:', err)
    });
  }

  private initChartMensal() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const valores = this.dadosMensal.map(d => d.valor);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.dataMensal = {
      labels: labels,
      datasets: [{
        label: 'Total de Receitas por Mês',
        backgroundColor: '#22c55e',
        data: valores
      }]
    };
    this.optionsMensal = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const valor = context.raw;
              return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { weight: 500 } },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value: number) => {
              return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
    this.cd.markForCheck();
  }
  filtrarDadosMensais() {
    this.carregarDadosMensais();
  }
  limparFiltrosMensais() {
    this.filtroMensal.categoria = null;
    this.filtroMensal.ano = new Date().getFullYear();
    this.filtroMensal.conta_id = null;
    this.filtroMensal.forma_recebimento = null;
    this.carregarDadosMensais();
  }
  carregarDadosDoGrafico() {
    const filtros: any = {};
    if (this.filtroConsolidado.dataSelecionada) {
      filtros.ano = this.filtroConsolidado.dataSelecionada.getFullYear();
      filtros.mes = this.filtroConsolidado.dataSelecionada.getMonth() + 1;
    }
    if (this.filtroConsolidado.conta_id) {
      filtros.conta_id = this.filtroConsolidado.conta_id;
    }
    if (this.filtroConsolidado.forma_recebimento) {
      filtros.forma_recebimento = this.filtroConsolidado.forma_recebimento;
    }

    this.receitaService.getReceitasConsolidadas(filtros).subscribe({
      next: (dados) => {
        if (dados.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Aviso',
            detail: 'Não há receitas para o período selecionado.'
          });
        } else {
          this.dadosConsolidado = dados;
          this.initChartCategorias();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados de receitas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar os dados.'
        });
      }
    });
  }

  private initChartCategorias() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const labels = this.dadosConsolidado.map(d => d.categoria);
    const valores = this.dadosConsolidado.map(d => d.valor);

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.dataConsolidado = {
      labels: labels, 
      datasets: [{
        label: 'Total por Categoria',
        backgroundColor: '#22c55e',
        data: valores
      }]
    };

    this.optionsConsolidado = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const valor = context.raw;
              return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { weight: 500 } },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value: number) => {
              return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
    this.cd.markForCheck();
  }

  filtrarDados() {
    this.carregarDadosDoGrafico();
  }

  limparFiltros() {
    this.filtroConsolidado.dataSelecionada = null;
    this.filtroConsolidado.conta_id = null;
    this.filtroConsolidado.forma_recebimento = null;
    this.carregarDadosDoGrafico();
  }
}
