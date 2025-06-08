import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter'; // Removed Splitter as it's not directly used here
import { ChartModule } from 'primeng/chart';
import { DespesaConsolidada } from '../../../models/despesa-consolidada';
import { DespesasService } from '../../../service/despesas.service';
import { isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button'; // Adicionar import do ButtonModule

@Component({
  selector: 'app-despesas',
  imports: [
    ChartModule,
    FooterComponent,
    NavBarSystemComponent,
    SplitterModule,
    CardModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    ButtonModule // Adicionar ButtonModule aqui
  ],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.css',
  providers: [MessageService, DespesasService]
})
export class DespesasComponent {
  dadosGrafico: DespesaConsolidada[] = [];

  data: any;
  options: any;

  filtro = {
    categoria: null as string | null,
    dataSelecionada: null as Date | null
  };

  categoriasOpcoes = [
    { label: 'Todas', value: null },
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
  ];

  platformId = inject(PLATFORM_ID);

  constructor(
    private cd: ChangeDetectorRef,
    private despesaService: DespesasService
  ) { }

  ngOnInit() {
    this.carregarDadosDoGrafico();
  }

  carregarDadosDoGrafico() {
    let params: any = {};

    params.ano = this.filtro.dataSelecionada
      ? this.filtro.dataSelecionada.getFullYear()
      : new Date().getFullYear();

    if (this.filtro.dataSelecionada) {
      params.mes = this.filtro.dataSelecionada.getMonth() + 1; 
    }

    if (this.filtro.categoria) {
      params.categoria = this.filtro.categoria;
    }

    this.despesaService.getDespesasConsolidadas(params).subscribe({
      next: (dados) => {
        this.dadosGrafico = dados;
        this.initChart();
      },
      error: (err) => {
        console.error('Erro ao carregar despesas consolidadas:', err);
      }
    });
  }

  initChart() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const valoresPorMes = Array(12).fill(0);

    // Mapeia os dados recebidos para o array de 12 meses
    this.dadosGrafico.forEach(d => {
      // 'mes' vem do backend como 1-12
      const mesIndex = d.mes - 1;
      if (mesIndex >= 0 && mesIndex < 12) {
        valoresPorMes[mesIndex] = d.valor;
      }
    });

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.data = {
      labels: meses,
      datasets: [
        {
          label: 'Total Despesas',
          backgroundColor: '#ef4444',
          borderColor: '#b91c1c',
          data: valoresPorMes
        }
      ]
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const valor = context.raw;
              return valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value: number) => {
              return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    this.options = {
      ...this.options,}
    this.cd.markForCheck();
  }
  filtrarDados() {
    this.carregarDadosDoGrafico();
  }

 
  limparFiltros() {
    this.filtro = { categoria: null, dataSelecionada: null };
    this.carregarDadosDoGrafico();
  }
}



