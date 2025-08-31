import { Component, OnInit } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { HeaderSystemComponent } from "../header-system/header-system.component";
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { RelatorioService, RelatorioMensal, RelatorioAnual } from '../../../service/relatorio.service';
import { firstValueFrom } from 'rxjs';

interface RelatorioModelo {
  id: string;
  nome: string;
  descricao: string;
  template: string;
  parametros: string[];
}

@Component({
  selector: 'app-smart-report',
  imports: [
    NavBarSystemComponent,
    FooterComponent,
    ToastModule,
    SplitterModule,
    HeaderSystemComponent,
    EditorModule,
    FormsModule,
    MessageModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    CommonModule,
  ],
  templateUrl: './smart-report.component.html',
  styleUrls: ['./smart-report.component.css'],
  providers: [MessageService]
})
export class SmartReportComponent implements OnInit {

  text: string | undefined;
  modeloSelecionado: RelatorioModelo | null = null;
  dataInicio: Date | null = null;
  dataFim: Date | null = null;
  parametrosAdicionais: { [key: string]: any } = {};
  carregando = false;

  relatorioMensal: RelatorioMensal | null = null;
  relatorioAnual: RelatorioAnual | null = null;

  modelosRelatorios: RelatorioModelo[] = [
    {
      id: 'mensal',
      nome: 'Relatório Mensal',
      descricao: 'Resumo financeiro mensal com receitas, despesas e saldo',
      template: `
        <h1>RELATÓRIO FINANCEIRO MENSAL</h1>
        <h2>Período: {{dataInicio}} a {{dataFim}}</h2>
        
        <h3>RESUMO EXECUTIVO</h3>
        <p>Este relatório apresenta o desempenho financeiro do período selecionado.</p>
        
        <h3>RECEITAS</h3>
        <p>Total de receitas: R$ {{receitasTotal}}</p>
        <p>Quantidade de receitas: {{quantidadeReceitas}}</p>
        <p>Principais fontes de receita:</p>
        <ul>
          {{receitasPorCategoria}}
        </ul>
        
        <h3>DESPESAS</h3>
        <p>Total de despesas: R$ {{despesasTotal}}</p>
        <p>Quantidade de despesas: {{quantidadeDespesas}}</p>
        <p>Principais categorias de despesa:</p>
        <ul>
          {{despesasPorCategoria}}
        </ul>
        
        <h3>RESULTADO</h3>
        <p>Saldo do período: R$ {{saldoPeriodo}}</p>
        
        <h3>ANÁLISE E RECOMENDAÇÕES</h3>
        <p>{{analiseRecomendacoes}}</p>
      `,
      parametros: ['dataInicio', 'dataFim', 'receitasTotal', 'despesasTotal', 'saldoPeriodo', 'quantidadeReceitas', 'quantidadeDespesas', 'receitasPorCategoria', 'despesasPorCategoria', 'analiseRecomendacoes']
    },
    {
      id: 'anual',
      nome: 'Relatório Anual',
      descricao: 'Relatório anual completo com análise estratégica',
      template: `
        <h1>RELATÓRIO FINANCEIRO ANUAL</h1>
        <h2>Ano: {{ano}}</h2>
        
        <h3>RESUMO EXECUTIVO ANUAL</h3>
        <p>Visão geral do desempenho financeiro anual e posicionamento estratégico.</p>
        
        <h3>RESULTADOS ANUAIS</h3>
        <p><strong>Receita Total Anual:</strong> R$ {{receitaTotalAnual}}</p>
        <p><strong>Despesa Total Anual:</strong> R$ {{despesaTotalAnual}}</p>
        <p><strong>Saldo Anual:</strong> R$ {{saldoAnual}}</p>
        
        <h3>EVOLUÇÃO MENSAL</h3>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Mês</th>
            <th>Receitas</th>
            <th>Despesas</th>
            <th>Saldo</th>
          </tr>
          {{dadosMensais}}
        </table>
        
        <h3>ANÁLISE POR SETOR/ÁREA</h3>
        <p>{{analisePorSetor}}</p>
        
        <h3>INVESTIMENTOS E CAPITAL</h3>
        <p>{{investimentosCapital}}</p>
        
        <h3>PERSPECTIVAS PARA O PRÓXIMO ANO</h3>
        <p>{{perspectivasProximoAno}}</p>
        
        <h3>RECOMENDAÇÕES ESTRATÉGICAS</h3>
        <p>{{recomendacoesEstrategicas}}</p>
      `,
      parametros: ['ano', 'receitaTotalAnual', 'despesaTotalAnual', 'saldoAnual', 'dadosMensais', 'analisePorSetor', 'investimentosCapital', 'perspectivasProximoAno', 'recomendacoesEstrategicas']
    },
    {
      id: 'personalizado',
      nome: 'Relatório Personalizado',
      descricao: 'Crie seu próprio relatório do zero',
      template: `
        <h1>RELATÓRIO PERSONALIZADO</h1>
        <h2>{{tituloRelatorio}}</h2>
        
        <p>{{conteudoPersonalizado}}</p>
        
        <h3>DADOS ADICIONAIS</h3>
        <p>{{dadosAdicionais}}</p>
        
        <h3>CONCLUSÕES</h3>
        <p>{{conclusoes}}</p>
      `,
      parametros: ['tituloRelatorio', 'conteudoPersonalizado', 'dadosAdicionais', 'conclusoes']
    }
  ];

  constructor(
    private relatorioService: RelatorioService,
    private messageService: MessageService
  ) {}

  anos: { label: string, value: number }[] = [];
meses: { label: string, value: number }[] = [
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
  { label: 'Dezembro', value: 12 },
];

anoSelecionado: number | null = null;
mesSelecionado: number | null = null;

  ngOnInit() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  for (let i = 0; i < 5; i++) {
    this.anos.push({ label: (anoAtual - i).toString(), value: anoAtual - i });
  }  
    this.dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  }

  selecionarModelo(modelo: RelatorioModelo) {
    this.modeloSelecionado = modelo;
    this.carregarDadosRelatorio();
  }

  async carregarDadosRelatorio() {
    if (!this.modeloSelecionado) return;

    this.carregando = true;
    try {
      switch (this.modeloSelecionado.id) {
        case 'mensal':
          await this.carregarRelatorioMensal();
          break;
        case 'anual':
          await this.carregarRelatorioAnual();
          break;
      }
      this.gerarRelatorioAutomatico();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados do relatório'
      });
    } finally {
      this.carregando = false;
    }
  }

  private async carregarRelatorioMensal() {
    if (!this.dataInicio || !this.dataFim) return;
    const ano = this.dataInicio.getFullYear();
    const mes = this.dataInicio.getMonth() + 1;
    this.relatorioMensal = await firstValueFrom(this.relatorioService.getRelatorioMensal(ano, mes));
  }

  private async carregarRelatorioAnual() {
    if (!this.dataInicio) return;
    const ano = this.dataInicio.getFullYear();
    this.relatorioAnual = await firstValueFrom(this.relatorioService.getRelatorioAnual(ano));
  }

  gerarRelatorioAutomatico() {
    if (!this.modeloSelecionado) return;

    let template = this.modeloSelecionado.template;

    if (this.dataInicio) template = template.replace('{{dataInicio}}', this.dataInicio.toLocaleDateString('pt-BR'));
    if (this.dataFim) template = template.replace('{{dataFim}}', this.dataFim.toLocaleDateString('pt-BR'));

    template = this.substituirParametrosEspecificos(template);

    this.modeloSelecionado.parametros.forEach(param => {
      const valor = this.parametrosAdicionais[param] || this.obterValorPadrao(param);
      template = template.replace(new RegExp(`{{${param}}}`, 'g'), valor);
    });

    this.text = template;
  }

  private substituirParametrosEspecificos(template: string): string {
    if (this.modeloSelecionado?.id === 'mensal' && this.relatorioMensal) {
      template = template.replace('{{receitasTotal}}', this.relatorioMensal.total_receitas.toFixed(2));
      template = template.replace('{{despesasTotal}}', this.relatorioMensal.total_despesas.toFixed(2));
      template = template.replace('{{saldoPeriodo}}', this.relatorioMensal.saldo_periodo.toFixed(2));
      template = template.replace('{{quantidadeReceitas}}', this.relatorioMensal.quantidade_receitas.toString());
      template = template.replace('{{quantidadeDespesas}}', this.relatorioMensal.quantidade_despesas.toString());

      const receitasCategoria = this.relatorioMensal.receitas_por_categoria
        .map(r => `<li>${r.categoria}: R$ ${r.valor.toFixed(2)}</li>`).join('');
      template = template.replace('{{receitasPorCategoria}}', receitasCategoria);

      const despesasCategoria = this.relatorioMensal.despesas_por_categoria
        .map(d => `<li>${d.categoria}: R$ ${d.valor.toFixed(2)}</li>`).join('');
      template = template.replace('{{despesasPorCategoria}}', despesasCategoria);
    }

    if (this.modeloSelecionado?.id === 'anual' && this.relatorioAnual) {
      template = template.replace('{{ano}}', this.relatorioAnual.ano.toString());
      template = template.replace('{{receitaTotalAnual}}', this.relatorioAnual.total_receitas.toFixed(2));
      template = template.replace('{{despesaTotalAnual}}', this.relatorioAnual.total_despesas.toFixed(2));
      template = template.replace('{{saldoAnual}}', this.relatorioAnual.saldo_periodo.toFixed(2));

      const dadosMensais = this.relatorioAnual.dados_mensais
        .map(d => `<tr><td>${d.mes}</td><td>R$ ${d.receitas.toFixed(2)}</td><td>R$ ${d.despesas.toFixed(2)}</td><td>R$ ${d.saldo_periodo.toFixed(2)}</td></tr>`).join('');
      template = template.replace('{{dadosMensais}}', dadosMensais);
    }

    return template;
  }

  obterValorPadrao(param: string): string {
    const valoresPadrao: { [key: string]: string } = {
      'analiseRecomendacoes': 'Análise a ser preenchida pelo usuário.',
      'ano': new Date().getFullYear().toString(),
      'analisePorSetor': 'Análise por setor a ser preenchida.',
      'investimentosCapital': 'Informações sobre investimentos a serem preenchidas.',
      'perspectivasProximoAno': 'Perspectivas para o próximo ano a serem definidas.',
      'recomendacoesEstrategicas': 'Recomendações estratégicas a serem desenvolvidas.',
      'tituloRelatorio': 'Título do Relatório',
      'conteudoPersonalizado': 'Conteúdo personalizado do relatório.',
      'dadosAdicionais': 'Dados adicionais relevantes.',
      'conclusoes': 'Conclusões do relatório.'
    };

    return valoresPadrao[param] || '[A ser preenchido]';
  }

  atualizarParametro(chave: string, valor: any) {
    this.parametrosAdicionais[chave] = valor;
    if (this.modeloSelecionado) this.gerarRelatorioAutomatico();
  }

  limparRelatorio() {
    this.text = '';
    this.modeloSelecionado = null;
    this.parametrosAdicionais = {};
    this.relatorioMensal = null;
    this.relatorioAnual = null;
  }

  salvarRelatorio() {
    console.log('Relatório salvo:', this.text);
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Relatório salvo com sucesso!'
    });
  }

  imprimirRelatorio() {
    window.print();
  }
}
