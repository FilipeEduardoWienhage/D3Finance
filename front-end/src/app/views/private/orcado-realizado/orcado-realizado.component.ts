import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { HeaderSystemComponent } from '../header-system/header-system.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RelatorioService, OrcadoRealizadoResponse } from '../../../service/relatorio.service';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-orcado-realizado',
  standalone: true,
  imports: [
    FooterComponent,
    NavBarSystemComponent,
    HeaderSystemComponent,
    ToastModule,
    ChartModule,
    CardModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    DropdownModule
  ],
  templateUrl: './orcado-realizado.component.html',
  styleUrl: './orcado-realizado.component.css',
  providers: [MessageService, RelatorioService]
})
export class OrcadoRealizadoComponent implements OnInit {
  // Dados e gráficos de Receitas
  dataReceitas: any;
  optionsReceitas: any;
  dadosRelatorioReceitas: OrcadoRealizadoResponse | null = null;
  
  // Dados e gráficos de Despesas
  dataDespesas: any;
  optionsDespesas: any;
  dadosRelatorioDespesas: OrcadoRealizadoResponse | null = null;
  
  platformId = inject(PLATFORM_ID);
  
  // Filtros de Receitas
  anoReceitas: number = new Date().getFullYear();
  mesReceitas: number | null = null;
  categoriaReceitas: string | null = null;
  
  // Filtros de Despesas
  anoDespesas: number = new Date().getFullYear();
  mesDespesas: number | null = null;
  categoriaDespesas: string | null = null;

  mesesOpcoes = [
    { label: 'Todos os meses', value: null },
    { label: 'Janeiro', value: 1 },
    { label: 'Fevereiro', value: 2 },
    { label: 'Março', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Maio', value: 5 },
    { label: 'Junho', value: 6 },
    { label: 'Julho', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Setembro', value: 9 },
    { label: 'Outubro', value: 10 },
    { label: 'Novembro', value: 11 },
    { label: 'Dezembro', value: 12 }
  ];

  categoriasReceitasOpcoes = [
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

  categoriasDespesasOpcoes = [
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

  constructor(
    private cd: ChangeDetectorRef,
    private relatorioService: RelatorioService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarDadosReceitas();
    this.carregarDadosDespesas();
  }

  carregarDadosReceitas() {
    this.relatorioService.getOrcadoRealizado(
      this.anoReceitas, 
      this.mesReceitas ?? undefined,
      this.categoriaReceitas ?? undefined
    ).subscribe({
      next: (dados) => {
        this.dadosRelatorioReceitas = dados;
        this.initChartReceitas();
      },
      error: (err) => {
        console.error('Erro ao carregar dados de receitas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar os dados de receitas orçado x realizado.'
        });
      }
    });
  }

  carregarDadosDespesas() {
    this.relatorioService.getOrcadoRealizadoDespesas(
      this.anoDespesas, 
      this.mesDespesas ?? undefined,
      this.categoriaDespesas ?? undefined
    ).subscribe({
      next: (dados) => {
        this.dadosRelatorioDespesas = dados;
        this.initChartDespesas();
      },
      error: (err) => {
        console.error('Erro ao carregar dados de despesas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar os dados de despesas orçado x realizado.'
        });
      }
    });
  }

  filtrarDadosReceitas() {
    this.carregarDadosReceitas();
  }

  filtrarDadosDespesas() {
    this.carregarDadosDespesas();
  }

  limparFiltrosReceitas() {
    this.anoReceitas = new Date().getFullYear();
    this.mesReceitas = null;
    this.categoriaReceitas = null;
    this.carregarDadosReceitas();
  }

  limparFiltrosDespesas() {
    this.anoDespesas = new Date().getFullYear();
    this.mesDespesas = null;
    this.categoriaDespesas = null;
    this.carregarDadosDespesas();
  }

  initChartReceitas() {
    if (!isPlatformBrowser(this.platformId) || !this.dadosRelatorioReceitas) {
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const labels = this.dadosRelatorioReceitas.dados_mensais.map(d => nomesMeses[d.mes - 1]);
    const orcados = this.dadosRelatorioReceitas.dados_mensais.map(d => d.orcado);
    const realizados = this.dadosRelatorioReceitas.dados_mensais.map(d => d.realizado);

    this.dataReceitas = {
      labels: labels,
      datasets: [
        {
          label: 'Orçado',
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          data: orcados
        },
        {
          label: 'Realizado',
          backgroundColor: '#22c55e',
          borderColor: '#22c55e',
          data: realizados
        }
      ]
    };

    this.optionsReceitas = this.criarOpcoesGrafico(textColor, textColorSecondary, surfaceBorder);
    this.cd.markForCheck();
  }

  initChartDespesas() {
    if (!isPlatformBrowser(this.platformId) || !this.dadosRelatorioDespesas) {
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const labels = this.dadosRelatorioDespesas.dados_mensais.map(d => nomesMeses[d.mes - 1]);
    const orcados = this.dadosRelatorioDespesas.dados_mensais.map(d => d.orcado);
    const realizados = this.dadosRelatorioDespesas.dados_mensais.map(d => d.realizado);

    this.dataDespesas = {
      labels: labels,
      datasets: [
        {
          label: 'Orçado',
          backgroundColor: '#9ca3af',
          borderColor: '#9ca3af',
          data: orcados
        },
        {
          label: 'Realizado',
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          data: realizados
        }
      ]
    };

    this.optionsDespesas = this.criarOpcoesGrafico(textColor, textColorSecondary, surfaceBorder);
    this.cd.markForCheck();
  }

  private criarOpcoesGrafico(textColor: string, textColorSecondary: string, surfaceBorder: string) {
    return {
      indexAxis: 'y',
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
              return `${context.dataset.label}: ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
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
            },
            callback: (value: number) => {
              return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }
}

