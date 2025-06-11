import { ChangeDetectorRef, Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ReceitaConsolidada } from '../../../models/receita-consolidada';
import { ReceitasService } from '../../../service/receitas.service';
import { ReceitaMensal } from '../../../models/receita-mensal';

@Component({
  selector: 'app-receitas',
  standalone: true,
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
    ToastModule
  ],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css'],
  providers: [MessageService, ReceitasService]
})
export class ReceitasComponent implements OnInit {
  // --- Propriedades Gráfico 1 (Categorias) ---
  dadosCategorias: ReceitaConsolidada[] = [];
  dataCategorias: any;
  optionsCategorias: any;

  dadosMensal: ReceitaMensal[] = [];
  dataMensal: any;
  optionsMensal: any;

  // --- Filtros Compartilhados ---
  filtro = {
    dataSelecionada: null as Date | null,
    categoria: null as string | null
  };

  categoriasOpcoes = [
    { label: 'Todas', value: null },
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


  platformId = inject(PLATFORM_ID);

  constructor(
    private cd: ChangeDetectorRef,
    private receitaService: ReceitasService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.carregarAmbosGraficos();
  }

  filtrarDados() {
    this.carregarAmbosGraficos();
  }

  limparFiltros() {
    this.filtro = { dataSelecionada: null, categoria: null };
    this.carregarAmbosGraficos();
  }

  private carregarAmbosGraficos() {
    this.carregarGraficoCategorias();
    this.carregarGraficoMensal();
  }

  private carregarGraficoCategorias() {
    const filtros: any = {};
    if (this.filtro.dataSelecionada) {
      filtros.ano = this.filtro.dataSelecionada.getFullYear();
      filtros.mes = this.filtro.dataSelecionada.getMonth() + 1;
    }
    this.receitaService.getReceitasPorCategoria(filtros).subscribe(dados => {
      this.dadosCategorias = dados; 
      this.initChartCategorias();
    });
  }

  private initChartCategorias() {
    const labels = this.dadosCategorias.map(d => d.mes);
    const valores = this.dadosCategorias.map(d => d.valor);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.dataCategorias = {
      labels: labels,
      datasets: [{
        label: 'Total por Categoria',
        backgroundColor: '#22c55e',
        data: valores
      }]
    };
    this.optionsCategorias = {
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
              return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
              return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

  }

  private carregarGraficoMensal() {
    const filtros: any = {};
    if (this.filtro.dataSelecionada) {
      filtros.ano = this.filtro.dataSelecionada.getFullYear();
    }
    if (this.filtro.categoria) {
      filtros.categoria = this.filtro.categoria;
    }
    this.receitaService.getReceitasPorMes(filtros).subscribe(dados => {
      if (this.filtro.categoria && dados.every(d => d.valor === 0)) {
        this.messageService.add({ severity: 'info', summary: 'Aviso', detail: 'Nenhuma receita para esta categoria no ano selecionado.' });
      } else {
        this.dadosCategorias = dados;
        this.initChartMensal();
      }
    });
  }

  private initChartMensal() {


    const labels = [
      'Todas',
      'Venda de Produtos',
      'Prestação de Serviços',
      'Receitas de Assinaturas / Mensalidades',
      'Receitas de Consultoria',
      'Receitas de Licenciamento',
      'Receitas de Aluguel de Bens',
      'Receita com Publicidade / Parcerias',
      'Recebimento de Contratos',
      'Royalties Recebidos',
      'Rendimentos de Investimentos',
      'Reembolso de Custos Operacionais',
      'Multas Contratuais Recebidas',
      'Recuperação de Crédito / Cobrança',
      'Outras Receitas Operacionais',
      'Outras Receitas Não Operacionais',
    ];
    const valores = this.dadosCategorias.map(d => d.valor);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.dataCategorias = {
      labels: labels,
      datasets: [{
        label: 'Total por Mês',
        backgroundColor: '#6366f1',
        data: valores
      }]
    };
    this.optionsCategorias = {
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
  }
}