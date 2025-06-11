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
  ],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css'],
  providers: [MessageService, DespesasService]
})
export class DespesasComponent implements OnInit {
  dadosGrafico: DespesaConsolidada[] = [];
  data: any;
  options: any;

  filtro = {
    dataSelecionada: null as Date | null
  };

  platformId = inject(PLATFORM_ID);


  constructor(
    private cd: ChangeDetectorRef,
    private despesaService: DespesasService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.carregarDadosDoGrafico();
  }

  carregarDadosDoGrafico() {
    const filtrosParaApi: any = {};

    if (this.filtro.dataSelecionada) {
      filtrosParaApi.ano = this.filtro.dataSelecionada.getFullYear();
      filtrosParaApi.mes = this.filtro.dataSelecionada.getMonth() + 1;
    }
    
    this.despesaService.getDespesasConsolidadas(filtrosParaApi).subscribe({
      next: (dados) => {
        if (dados.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Aviso',
                detail: 'Não há despesas para o período selecionado.'
            });
            this.dadosGrafico = [];
        } else {
            this.dadosGrafico = dados;
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

    
    const labels = this.dadosGrafico.map(d => d.categoria);
    const valores = this.dadosGrafico.map(d => d.valor);

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.data = {
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

    this.options = {
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
    this.carregarDadosDoGrafico();
  }

  limparFiltros() {
    this.filtro.dataSelecionada = null;
    this.carregarDadosDoGrafico();
  }
}