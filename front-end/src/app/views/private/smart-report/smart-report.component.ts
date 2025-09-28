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
        
        
        <h3>RESUMO POR CONTA</h3>
        <h4>Receitas por Conta:</h4>
        <ul>
          {{receitasPorConta}}
        </ul>
        
        <h4>Despesas por Conta:</h4>
        <ul>
          {{despesasPorConta}}
        </ul>
        
        <h3>RESULTADO</h3>
        <p>Saldo do período: R$ {{saldoPeriodo}}</p>
        
        <h3>ANÁLISE E RECOMENDAÇÕES</h3>
        <p>{{analiseRecomendacoes}}</p>
      `,
      parametros: ['dataInicio', 'dataFim', 'receitasTotal', 'despesasTotal', 'saldoPeriodo', 'quantidadeReceitas', 'quantidadeDespesas', 'receitasPorCategoria', 'despesasPorCategoria', 'receitasPorConta', 'despesasPorConta', 'analiseRecomendacoes']
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
        
        <h3>RESUMO POR CONTA</h3>
        <h4>Receitas por Conta:</h4>
        <ul>
          {{receitasPorConta}}
        </ul>
        
        <h4>Despesas por Conta:</h4>
        <ul>
          {{despesasPorConta}}
        </ul>
        
        <h3>ANÁLISE POR SETOR/ÁREA</h3>
        <p>{{analisePorSetor}}</p>
        
        <h3>INVESTIMENTOS E CAPITAL</h3>
        <p>{{investimentosCapital}}</p>
        
        <h3>PERSPECTIVAS PARA O PRÓXIMO ANO</h3>
        <p>{{perspectivasProximoAno}}</p>
        
        <h3>RECOMENDAÇÕES ESTRATÉGICAS</h3>
        <p>{{recomendacoesEstrategicas}}</p>
      `,
      parametros: ['ano', 'receitaTotalAnual', 'despesaTotalAnual', 'saldoAnual', 'dadosMensais', 'receitasPorConta', 'despesasPorConta', 'analisePorSetor', 'investimentosCapital', 'perspectivasProximoAno', 'recomendacoesEstrategicas']
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
    
    // Inicializar com o mês e ano atual
    this.anoSelecionado = anoAtual;
    this.mesSelecionado = hoje.getMonth() + 1;
    this.atualizarDatas();
    
    console.log('Datas inicializadas:', { 
      anoSelecionado: this.anoSelecionado,
      mesSelecionado: this.mesSelecionado,
      dataInicio: this.dataInicio, 
      dataFim: this.dataFim
    });
  }

  atualizarDatas() {
    if (this.anoSelecionado && this.mesSelecionado) {
      this.dataInicio = new Date(this.anoSelecionado, this.mesSelecionado - 1, 1);
      this.dataFim = new Date(this.anoSelecionado, this.mesSelecionado, 0);
      
      console.log('Datas atualizadas:', { 
        anoSelecionado: this.anoSelecionado,
        mesSelecionado: this.mesSelecionado,
        dataInicio: this.dataInicio, 
        dataFim: this.dataFim
      });
      
      // Recarregar dados se já houver um modelo selecionado
      if (this.modeloSelecionado) {
        this.carregarDadosRelatorio();
      }
    }
  }

  selecionarModelo(modelo: RelatorioModelo) {
    console.log('Modelo selecionado:', modelo);
    this.modeloSelecionado = modelo;
    this.carregarDadosRelatorio();
  }

  async carregarDadosRelatorio() {
    if (!this.modeloSelecionado) return;

    this.carregando = true;
    try {
      console.log('Iniciando carregamento de dados para modelo:', this.modeloSelecionado.id);
      
      switch (this.modeloSelecionado.id) {
        case 'mensal':
          await this.carregarRelatorioMensal();
          break;
        case 'anual':
          await this.carregarRelatorioAnual();
          break;
      }
      
      console.log('Dados carregados, gerando relatório...');
      this.atualizarRelatorio();
    } catch (error) {
      console.error('Erro detalhado ao carregar dados:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao carregar dados do relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      this.carregando = false;
    }
  }

  private async carregarRelatorioMensal() {
    if (!this.anoSelecionado || !this.mesSelecionado) {
      console.log('Ano ou mês não selecionado para relatório mensal');
      return;
    }
    console.log('Carregando relatório mensal para:', { ano: this.anoSelecionado, mes: this.mesSelecionado });
    this.relatorioMensal = await firstValueFrom(this.relatorioService.getRelatorioMensal(this.anoSelecionado, this.mesSelecionado));
    console.log('Relatório mensal carregado:', this.relatorioMensal);
  }

  private async carregarRelatorioAnual() {
    if (!this.anoSelecionado) {
      console.log('Ano não selecionado para relatório anual');
      return;
    }
    console.log('Carregando relatório anual para:', { ano: this.anoSelecionado });
    this.relatorioAnual = await firstValueFrom(this.relatorioService.getRelatorioAnual(this.anoSelecionado));
    console.log('Relatório anual carregado:', this.relatorioAnual);
    console.log('Receitas por conta anual:', this.relatorioAnual?.receitas_por_conta);
    console.log('Despesas por conta anual:', this.relatorioAnual?.despesas_por_conta);
  }


  atualizarRelatorio() {
    if (!this.modeloSelecionado) return;

    console.log('Gerando relatório automático para modelo:', this.modeloSelecionado.id);
    
    let template = this.modeloSelecionado.template;

    if (this.dataInicio) template = template.replace('{{dataInicio}}', this.dataInicio.toLocaleDateString('pt-BR'));
    if (this.dataFim) template = template.replace('{{dataFim}}', this.dataFim.toLocaleDateString('pt-BR'));

    template = this.substituirParametrosEspecificos(template);

    this.modeloSelecionado.parametros.forEach(param => {
      const valor = this.parametrosAdicionais[param] || this.obterValorPadrao(param);
      template = template.replace(new RegExp(`{{${param}}}`, 'g'), valor);
    });

    this.text = template;
    console.log('Relatório gerado:', this.text ? 'Sim' : 'Não');
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

      // Gerar resumo por conta para receitas
      const receitasContaHtml = (this.relatorioMensal.receitas_por_conta || [])
        .map(r => `<li><strong>${r.conta}</strong>: R$ ${r.valor.toFixed(2)}</li>`).join('');
      template = template.replace('{{receitasPorConta}}', receitasContaHtml || '<li><em>Nenhuma receita encontrada no período</em></li>');

      // Gerar resumo por conta para despesas
      const despesasContaHtml = (this.relatorioMensal.despesas_por_conta || [])
        .map(d => `<li><strong>${d.conta}</strong>: R$ ${d.valor.toFixed(2)}</li>`).join('');
      template = template.replace('{{despesasPorConta}}', despesasContaHtml || '<li><em>Nenhuma despesa encontrada no período</em></li>');
    }

    if (this.modeloSelecionado?.id === 'anual' && this.relatorioAnual) {
      template = template.replace('{{ano}}', this.relatorioAnual.ano.toString());
      template = template.replace('{{receitaTotalAnual}}', this.relatorioAnual.total_receitas.toFixed(2));
      template = template.replace('{{despesaTotalAnual}}', this.relatorioAnual.total_despesas.toFixed(2));
      template = template.replace('{{saldoAnual}}', this.relatorioAnual.saldo_periodo.toFixed(2));

      const dadosMensais = this.relatorioAnual.dados_mensais
        .map(d => `<tr><td>${d.mes}</td><td>R$ ${d.receitas.toFixed(2)}</td><td>R$ ${d.despesas.toFixed(2)}</td><td>R$ ${d.saldo_periodo.toFixed(2)}</td></tr>`).join('');
      template = template.replace('{{dadosMensais}}', dadosMensais);

      // Gerar resumo por conta para receitas (anual)
      const receitasContaHtml = (this.relatorioAnual.receitas_por_conta || [])
        .map(r => `<li><strong>${r.conta}</strong>: R$ ${r.valor.toFixed(2)}</li>`).join('');
      template = template.replace('{{receitasPorConta}}', receitasContaHtml || '<li><em>Nenhuma receita encontrada no período</em></li>');

      // Gerar resumo por conta para despesas (anual)
      const despesasContaHtml = (this.relatorioAnual.despesas_por_conta || [])
        .map(d => `<li><strong>${d.conta}</strong>: R$ ${d.valor.toFixed(2)}</li>`).join('');
      template = template.replace('{{despesasPorConta}}', despesasContaHtml || '<li><em>Nenhuma despesa encontrada no período</em></li>');
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
      'analiseObservacoes': 'Análise e observações sobre o período analisado.',
      'receitasPorConta': '<li>Nenhuma receita por conta encontrada</li>',
      'despesasPorConta': '<li>Nenhuma despesa por conta encontrada</li>'
    };

    return valoresPadrao[param] || '[A ser preenchido]';
  }

  atualizarParametro(chave: string, valor: any) {
    this.parametrosAdicionais[chave] = valor;
    if (this.modeloSelecionado) this.atualizarRelatorio();
  }

  limparRelatorio() {
    this.text = '';
    this.modeloSelecionado = null;
    this.parametrosAdicionais = {};
    this.relatorioMensal = null;
    this.relatorioAnual = null;
  }


  salvarRelatorio() {
    if (!this.text || !this.modeloSelecionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nenhum relatório foi gerado para salvar!'
      });
      return;
    }

    try {
      // Converter HTML para texto limpo
      const textoLimpo = this.converterHtmlParaTexto(this.text);
      
      // Adicionar cabeçalho e rodapé
      const conteudoCompleto = `
${this.modeloSelecionado.nome.toUpperCase()}
${'='.repeat(this.modeloSelecionado.nome.length + 10)}

${textoLimpo}

${'='.repeat(50)}
Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
Diamond Three Finance
`;

      // Criar o blob e fazer download
      const blob = new Blob([conteudoCompleto], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Nome do arquivo baseado no tipo de relatório e data
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `${this.modeloSelecionado.nome.replace(/\s+/g, '_')}_${dataAtual}.txt`;
      
      link.href = url;
      link.download = nomeArquivo;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL do objeto
      window.URL.revokeObjectURL(url);

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Relatório salvo como: ${nomeArquivo}`
      });

    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar o relatório. Tente novamente.'
      });
    }
  }

  private converterHtmlParaTexto(html: string): string {
    // Criar um elemento temporário para converter HTML para texto
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Substituir elementos HTML por formatação de texto
    let texto = tempDiv.innerHTML;

    // Substituir tags de cabeçalho
    texto = texto.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n$1\n' + '='.repeat(50) + '\n');
    texto = texto.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n$1\n' + '-'.repeat(30) + '\n');
    texto = texto.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n$1\n' + '-'.repeat(20) + '\n');
    texto = texto.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n$1:\n');

    // Substituir parágrafos
    texto = texto.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');

    // Substituir listas
    texto = texto.replace(/<ul[^>]*>/gi, '\n');
    texto = texto.replace(/<\/ul>/gi, '\n');
    texto = texto.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');

    // Substituir tabelas (formato simples)
    texto = texto.replace(/<table[^>]*>/gi, '\n');
    texto = texto.replace(/<\/table>/gi, '\n');
    texto = texto.replace(/<thead[^>]*>/gi, '');
    texto = texto.replace(/<\/thead>/gi, '');
    texto = texto.replace(/<tbody[^>]*>/gi, '');
    texto = texto.replace(/<\/tbody>/gi, '');
    texto = texto.replace(/<tr[^>]*>/gi, '');
    texto = texto.replace(/<\/tr>/gi, '\n');
    texto = texto.replace(/<th[^>]*>(.*?)<\/th>/gi, '$1\t');
    texto = texto.replace(/<td[^>]*>(.*?)<\/td>/gi, '$1\t');

    // Substituir tags de formatação
    texto = texto.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1');
    texto = texto.replace(/<b[^>]*>(.*?)<\/b>/gi, '$1');
    texto = texto.replace(/<em[^>]*>(.*?)<\/em>/gi, '$1');
    texto = texto.replace(/<i[^>]*>(.*?)<\/i>/gi, '$1');

    // Remover outras tags HTML
    texto = texto.replace(/<[^>]*>/g, '');

    // Decodificar entidades HTML
    texto = texto.replace(/&nbsp;/g, ' ');
    texto = texto.replace(/&amp;/g, '&');
    texto = texto.replace(/&lt;/g, '<');
    texto = texto.replace(/&gt;/g, '>');
    texto = texto.replace(/&quot;/g, '"');

    // Limpar espaços extras e quebras de linha
    texto = texto.replace(/\n\s*\n\s*\n/g, '\n\n');
    texto = texto.replace(/^\s+|\s+$/g, '');

    return texto;
  }

  imprimirRelatorio() {
    window.print();
  }
}
