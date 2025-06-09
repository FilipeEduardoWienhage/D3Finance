import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject, effect } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ReceitasService } from '../../../service/receitas.service';
import { ReceitaConsolidada } from '../../../models/receita-consolidada';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-receitas',
  imports: [
    ChartModule,
    FooterComponent,
    NavBarSystemComponent,
    SplitterModule,
    CardModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.css',
  providers: [MessageService, ReceitasService],
})
export class ReceitasComponent {
  dados: ReceitaConsolidada[] = [];
  data: any;
  options: any;

  filtro = {
    categoria: null as string | null,
    dataSelecionada: null as Date | null
  };

  platformId = inject(PLATFORM_ID);

  categoriasOpcoes = [
    {label: 'Todas', value: null },
    { label: 'Venda de Produtos', value: 'Venda de Produtos' },
    { label: 'Prestação de Serviços', value: 'Prestação de Serviços' },
    { label: 'Receitas de Assinaturas / Mensalidades', value: 'Receitas de Assinaturas / Mensalidades' },
    { label: 'Receitas de Consultoria', value: 'Receitas de Consultoria' },
    { label: 'Receitas de Licenciamento', value: 'Receitas de Licenciamento' },
    { label: 'Receitas de Aluguel de Bens', value: 'Receitas de Aluguel de Bens' },
    { label: 'Receita com Publicidade / Parcerias', value: 'Receita com Publicidade / Parcerias' },
    { label: 'Recebimento de Contratos', value: 'Recebimento de Contratos' },
    { label: 'Royalties Recebidos', value: 'Royalties Recebidos' },
    { label: 'Rendimentos de Investimentos', value: 'Rendimentos de Investimentos' },
    { label: 'Reembolso de Custos Operacionais', value: 'Reembolso de Custos Operacionais' },
    { label: 'Multas Contratuais Recebidas', value: 'Multas Contratuais Recebidas' },
    { label: 'Recuperação de Crédito / Cobrança', value: 'Recuperação de Crédito / Cobrança' },
    { label: 'Outras Receitas Operacionais', value: 'Outras Receitas Operacionais' },
    { label: 'Outras Receitas Não Operacionais', value: 'Outras Receitas Não Operacionais' }
  ];

  constructor(
    private cd: ChangeDetectorRef,
    private receitaService: ReceitasService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.carregarDadosDoGrafico();
  }

  carregarDadosDoGrafico() {
    const filtrosParaApi: any = {};

    filtrosParaApi.ano = this.filtro.dataSelecionada
      ? this.filtro.dataSelecionada.getFullYear()
      : new Date().getFullYear();


    if (this.filtro.dataSelecionada) {
      filtrosParaApi.mes = this.filtro.dataSelecionada.getMonth() + 1;
    }

    if (this.filtro.categoria) {
      filtrosParaApi.categoria = this.filtro.categoria;
    }

    this.receitaService.getReceitasConsolidadas(filtrosParaApi).subscribe({
      next: (dados) => {
        const isDataEmpty = dados.every(d => d.valor === 0);
        if (this.filtro.categoria && isDataEmpty) {
          this.messageService.add({
            severity: 'info',
            summary: 'Informação',
            detail: 'Não há dados para a categoria selecionada.'
          });
        } else {
          this.dados = dados;
          this.initChart();
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados do gráfico.'
        });
      }
    });
  }


  initChart() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const valoresPorMes = Array(12).fill(0);

    this.dados.forEach(dado => {
      const mesIndex = dado.mes - 1;
      if (mesIndex >= 0 && mesIndex < 12) {
        valoresPorMes[mesIndex] += dado.valor;
      }
    }
    );

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.data = {
      labels: meses,
      datasets: [
        {
          label: 'Total Receitas',
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
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
    this.cd.markForCheck()
  }
  filtrarDados() {
    this.carregarDadosDoGrafico();
  }

  limparFiltros() {
    this.filtro = { categoria: null, dataSelecionada: null };
    this.carregarDadosDoGrafico();
  }
}

