/**
 * Componente de Chat do Assistente Financeiro
 */
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssistenteService } from '../../../service/assistente.service';
import { MensagemChat, QueryExecutada } from '../../../models/assistente.model';
import { HeaderSystemComponent } from '../header-system/header-system.component';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FooterComponent } from '../../shared/footer/footer.component';


@Component({
  selector: 'app-chat-assistente',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderSystemComponent, NavBarSystemComponent, ToastModule, FooterComponent],
  templateUrl: './chat-assistente.component.html',
  styleUrls: ['./chat-assistente.component.css'],
  providers: [
    MessageService,
  ]
})
export class ChatAssistenteComponent implements OnInit, AfterViewChecked {

  mensagens: MensagemChat[] = [];
  mensagemAtual: string = '';
  carregando: boolean = false;
  mostrarQueries: { [key: number]: boolean } = {};

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  private shouldScroll = false;

  constructor(private assistenteService: AssistenteService) { }

  ngOnInit(): void {
    // Mensagem de boas-vindas
    this.adicionarMensagemSistema('Olá! Me chamo Filipe Luis sou seu assistente financeiro. Como posso ajudar?');
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /**
   * Envia uma pergunta ao assistente
   */
  enviarPergunta(): void {
    if (!this.mensagemAtual.trim() || this.carregando) {
      return;
    }

    const pergunta = this.mensagemAtual.trim();
    this.mensagemAtual = '';

    // Adiciona a pergunta do usuário
    this.mensagens.push({
      pergunta: pergunta,
      resposta: '',
      queries_executadas: [],
      usuario_id: 0,
      timestamp: new Date()
    });

    this.shouldScroll = true;
    this.carregando = true;

    // Envia para o assistente
    this.assistenteService.fazerPergunta(pergunta, true).subscribe({
      next: (resposta) => {
        // Atualiza a última mensagem com a resposta
        const ultimaMensagem = this.mensagens[this.mensagens.length - 1];
        ultimaMensagem.resposta = resposta.resposta;
        ultimaMensagem.queries_executadas = resposta.queries_executadas;
        ultimaMensagem.usuario_id = resposta.usuario_id;

        this.carregando = false;
        this.shouldScroll = true;
      },
      error: (error) => {
        console.error('Erro ao obter resposta:', error);
        this.mensagens[this.mensagens.length - 1].resposta =
          'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.';
        this.carregando = false;
        this.shouldScroll = true;
      }
    });
  }

  /**
   * Limpa o histórico de conversa
   */
  limparChat(): void {
    this.assistenteService.limparHistorico().subscribe({
      next: () => {
        this.mensagens = [];
        this.adicionarMensagemSistema('Histórico limpo! Como posso ajudar?');
      },
      error: (error) => {
        console.error('Erro ao limpar histórico:', error);
      }
    });
  }

  /**
   * Alterna a exibição das queries SQL
   */
  toggleQueries(index: number): void {
    this.mostrarQueries[index] = !this.mostrarQueries[index];
  }

  /**
   * Adiciona uma mensagem do sistema
   */
  private adicionarMensagemSistema(texto: string): void {
    this.mensagens.push({
      pergunta: '',
      resposta: texto,
      queries_executadas: [],
      usuario_id: 0,
      timestamp: new Date()
    });
  }

  /**
   * Rola para o final do chat
   */
  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Erro ao rolar chat:', err);
    }
  }

  /**
   * Verifica se Enter foi pressionado (sem Shift)
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarPergunta();
    }
  }

  /**
   * Formata o SQL para exibição
   */
  formatarSQL(sql: string): string {
    if (!sql) return '';
    return sql
      .replace(/SELECT/gi, '\nSELECT')
      .replace(/FROM/gi, '\nFROM')
      .replace(/WHERE/gi, '\nWHERE')
      .replace(/AND/gi, '\n  AND')
      .replace(/OR/gi, '\n  OR')
      .replace(/ORDER BY/gi, '\nORDER BY')
      .replace(/GROUP BY/gi, '\nGROUP BY')
      .trim();
  }
}

