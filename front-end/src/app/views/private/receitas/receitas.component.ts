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
    DropdownModule
  ],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css'],
  providers: [MessageService, ReceitasService]
})
export class ReceitasComponent implements OnInit {
  dadosGrafico1: ReceitaConsolidada[] = [];
  data1: any;
  options1: any;

  dadosGrafico2: ReceitaMensal[] = [];
  data2: any;
  options2: any;

  filtro1 = {
    dataSelecionada: null as Date | null
  };

  filtro2 = {
    categoria: null as string | null,
    ano: new Date().getFullYear()
  };

  categoriasOpcoes = [
    { label: 'Todas as Categorias', value: null },
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
    this.carregarDadosDoGrafico();
    this.carregarDadosMensais();
  }


  carregarDadosMensais() {
    const filtrosParaApi = {
      ano: this.filtro2.ano,
      categoria: this.filtro2.categoria
    };
    this.receitaService.getReceitasConsolidadasMensal(filtrosParaApi).subscribe({
      next: (dados) => {
        if (this.filtro2.categoria && dados.every(d => d.valor === 0)) {
          this.messageService.add({
            severity: 'info',
            summary: 'Aviso',
            detail: 'Não há receitas para esta categoria no ano selecionado.'
          });
        } else {
          this.dadosGrafico2 = dados;
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
    const valores = this.dadosGrafico2.map(d => d.valor);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.data2 = {
      labels: labels,
      datasets: [{
        label: 'Total de Receitas por Mês',
        backgroundColor: '#22c55e',
        data: valores
      }]
    };
    this.options2 = {
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
    this.filtro2.categoria = null;
    this.filtro2.ano = new Date().getFullYear();
    this.carregarDadosMensais();
  }



  carregarDadosDoGrafico() {
    const filtros: any = {};
    if (this.filtro1.dataSelecionada) {
      filtros.ano = this.filtro1.dataSelecionada.getFullYear();
      filtros.mes = this.filtro1.dataSelecionada.getMonth() + 1;
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
          this.dadosGrafico1 = dados;
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

    // 4. CORREÇÃO PRINCIPAL: Usa 'd.categoria' para os rótulos
    const labels = this.dadosGrafico1.map(d => d.categoria);
    const valores = this.dadosGrafico1.map(d => d.valor);

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.data1 = {
      labels: labels, // <- Agora funciona
      datasets: [{
        label: 'Total por Categoria',
        backgroundColor: '#22c55e',
        data: valores
      }]
    };

    this.options1 = {
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
    this.filtro1.dataSelecionada = null;
    this.carregarDadosDoGrafico();
  }
}
