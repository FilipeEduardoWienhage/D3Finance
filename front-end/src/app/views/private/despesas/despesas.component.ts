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
    DropdownModule
  ],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css'],
  providers: [MessageService, DespesasService]
})
export class DespesasComponent implements OnInit {
  dadosConsolidado: DespesaConsolidada[] = [];
  dataConsolidado: any;
  optionsConsolidado: any;

  dadosMensal: DespesaMensal[] = [];
  dataMensal: any;
  optionsMensal: any;

  filtroConsolidado = {
    dataSelecionada: null as Date | null
  };

  filtroMensal = {
    categoria: null as string | null,
    ano: new Date().getFullYear()
  };

  categoriasOpcoes = [
    { label: 'Todas as Categorias', value: null },
    { label: 'Despesas com Pessoal', value: 'Despesas com Pessoal' },
    { label: 'Despesas Operacionais', value: 'Despesas Operacionais' },
    { label: 'Despesas com Materiais', value: 'Despesas com Materiais' },
    { label: 'Despesas Administrativas', value: 'Despesas Administrativas' },
    { label: 'Despesas com Marketing', value: 'Despesas com Marketing' },
    { label: 'Despesas com Transporte', value: 'Despesas com Transporte' },
    { label: 'Impostos e Taxas', value: 'Impostos e Taxas' },
    { label: 'Despesas Financeiras', value: 'Despesas Financeiras' },
    { label: 'Manutenção e Reparos', value: 'Manutenção e Reparos' },
    { label: 'Despesas com Terceirizados', value: 'Despesas com Terceirizados' },
    { label: 'Outras Despesas', value: 'Outras Despesas' }
  ]

  platformId = inject(PLATFORM_ID);

  constructor(
    private cd: ChangeDetectorRef,
    private despesaService: DespesasService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.carregarDadosConsolidado();
    this.carregarDadosMensal();
  }


  carregarDadosMensal() {
    const filtrosParaApi: any = {
      ano: this.filtroMensal.ano,
      categoria: this.filtroMensal.categoria
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
    this.carregarDadosMensal();
  }


  carregarDadosConsolidado() {
    const filtrosParaApi: any = {};

    if (this.filtroConsolidado.dataSelecionada) {
      filtrosParaApi.ano = this.filtroConsolidado.dataSelecionada.getFullYear();
      filtrosParaApi.mes = this.filtroConsolidado.dataSelecionada.getMonth() + 1;
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
    this.carregarDadosConsolidado();
  }
}