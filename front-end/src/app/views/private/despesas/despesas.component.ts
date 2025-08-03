import { ChangeDetectorRef, Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FooterComponent } from '../../shared/footer/footer.component';
import { DespesasService } from '../../../service/despesas.service';
import { DespesaConsolidada } from '../../../models/despesa-consolidada';
import { DespesaMensal } from '../../../models/despesa-mensal';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ContasService } from '../../../service/contas.service';
import { PrimeNG } from 'primeng/config';
import { HeaderSystemComponent } from '../header-system/header-system.component';


@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [
    ChartModule,
    FooterComponent,
    NavBarSystemComponent,
    SplitterModule,
    CardModule,
    CalendarModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    DropdownModule,
    InputTextModule,
    HeaderSystemComponent,
  ],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css'],
  providers: [MessageService, DespesasService, ContasService]
})
export class DespesasComponent implements OnInit {
  dadosConsolidado: DespesaConsolidada[] = [];
  dataConsolidado: any;
  optionsConsolidado: any;

  dadosMensal: DespesaMensal[] = [];
  dataMensal: any;
  optionsMensal: any;

  filtroConsolidado = {
    dataSelecionada: null as Date | null,
    conta_id: null as number | null,
    forma_pagamento: null as string | null
  };

  filtroMensal = {
    categoria: null as string | null,
    ano: new Date().getFullYear(),
    conta_id: null as number | null,
    forma_pagamento: null as string | null
  };

  contasOpcoes = [
    { label: 'Todas as Contas', value: null }
  ];

  categoriasOpcoes = [
    { label: 'Todas as Categorias', value: null },
    { label: 'Despesas Administrativas', value: 'Despesas Administrativas' },
    { label: 'Despesas Financeiras', value: 'Despesas Financeiras' },
    { label: 'Despesas Operacionais', value: 'Despesas Operacionais' },
    { label: 'Despesas com Marketing', value: 'Despesas com Marketing' },
    { label: 'Despesas com Materiais', value: 'Despesas com Materiais' },
    { label: 'Despesas com Pessoal', value: 'Despesas com Pessoal' },
    { label: 'Despesas com Terceirizados', value: 'Despesas com Terceirizados' },
    { label: 'Despesas com Transporte', value: 'Despesas com Transporte' },
    { label: 'Impostos e Taxas', value: 'Impostos e Taxas' },
    { label: 'Manutenção e Reparos', value: 'Manutenção e Reparos' },
    { label: 'Outras Despesas', value: 'Outras Despesas' }
  ];

  formasPagamentoOpcoes = [
    { label: 'Todas as Formas', value: null },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Crédito', value: 'credito' },
    { label: 'Débito', value: 'debito' },
    { label: 'Depósito', value: 'deposito' },
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Pix', value: 'pix' }
  ];

  statusDespesaOpcoes = [
    { label: 'Todos os Status', value: null },
    { label: 'Pago', value: 'pago' },
    { label: 'Pendente', value: 'pendente' },
    { label: 'Atrasado', value: 'atrasado' }
  ];

  platformId = inject(PLATFORM_ID);

  constructor(
    private cd: ChangeDetectorRef,
    private despesaService: DespesasService,
    private messageService: MessageService,
    private contasService: ContasService,
    private primengConfig: PrimeNG
  ) { }


  ngOnInit() {
    this.carregarContas();
    this.carregarDadosConsolidado();
    this.carregarDadosMensal();
    this.primengConfig.setTranslation({
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'Sm',
      firstDayOfWeek: 0,
    });
  }

  carregarContas() {
    this.contasService.getContas().subscribe({
      next: (contas) => {
        console.log('Contas carregadas (despesas):', contas);
        this.contasOpcoes = [
          { label: 'Todas as Contas', value: null },
          ...contas.map(conta => ({
            label: conta.nome_conta,
            value: conta.id
          }))
        ];
        console.log('Opções de contas (despesas):', this.contasOpcoes);
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

  carregarDadosMensal() {
    const filtrosParaApi: any = {
      ano: this.filtroMensal.ano,
      categoria: this.filtroMensal.categoria,
      conta_id: this.filtroMensal.conta_id,
      forma_pagamento: this.filtroMensal.forma_pagamento
    };
    this.despesaService.getDespesaConsolidadasMensal(filtrosParaApi).subscribe({
      next: (dados) => {
        if (this.filtroMensal.categoria && dados.every(d => d.valor === 0)) {
          this.messageService.add({
            severity: 'info',
            summary: 'Aviso',
            detail: 'Não há despesas para a categoria selecionada.'
          });
        } else {
          this.dadosMensal = dados;
          this.initChartMensal();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar despesas mensais:', err);
        this.messageService.add({
          severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os dados.'
        });
      }
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
        backgroundColor: '#ef4444',
        borderColor: '#b91c1c',
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
    this.carregarDadosMensal();
  }
  limparFiltrosMensais() {
    this.filtroMensal.categoria = null;
    this.filtroMensal.ano = new Date().getFullYear();
    this.filtroMensal.conta_id = null;
    this.filtroMensal.forma_pagamento = null;
    this.carregarDadosMensal();
  }

  carregarDadosConsolidado() {
    const filtrosParaApi: any = {};

    if (this.filtroConsolidado.dataSelecionada) {
      filtrosParaApi.ano = this.filtroConsolidado.dataSelecionada.getFullYear();
      filtrosParaApi.mes = this.filtroConsolidado.dataSelecionada.getMonth() + 1;
    }
    if (this.filtroConsolidado.conta_id) {
      filtrosParaApi.conta_id = this.filtroConsolidado.conta_id;
    }
    if (this.filtroConsolidado.forma_pagamento) {
      filtrosParaApi.forma_pagamento = this.filtroConsolidado.forma_pagamento;
    }

    this.despesaService.getDespesasConsolidadas(filtrosParaApi).subscribe({
      next: (dados) => {
        if (dados.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Aviso',
            detail: 'Não há despesas para o período selecionado.'
          });
          this.dadosConsolidado = [];
        } else {
          this.dadosConsolidado = dados;
          this.initChart();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar despesas consolidadas:', err);
        this.messageService.add({
          severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os dados.'
        });
      }
    });
  }

  initChart() {
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
      datasets: [
        {
          label: 'Despesas Mensais por Categoria',
          backgroundColor: '#ef4444',
          borderColor: '#b91c1c',
          data: valores
        }
      ]
    };

    this.optionsConsolidado = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { labels: { color: textColor } },
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
    this.carregarDadosConsolidado();
  }

  limparFiltros() {
    this.filtroConsolidado.dataSelecionada = null;
    this.filtroConsolidado.conta_id = null;
    this.filtroConsolidado.forma_pagamento = null;
    this.carregarDadosConsolidado();
  }
}