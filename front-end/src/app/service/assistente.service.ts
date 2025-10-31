/**
 * Serviço para comunicação com o Assistente Financeiro
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.prod';
import { MensagemAssistenteResponse, PerguntaRequest } from '../models/assistente.model';

@Injectable({
  providedIn: 'root'
})
export class AssistenteService {
  
  private apiUrl = `${environment.apiUrl}/assistente`;
  
  constructor(private http: HttpClient) {}

  /**
   * Faz uma pergunta ao assistente financeiro
   */
  fazerPergunta(pergunta: string, manterContexto: boolean = true): Observable<MensagemAssistenteResponse> {
    const headers = this.getHeaders();
    const body: PerguntaRequest = {
      pergunta: pergunta,
      manter_contexto: manterContexto
    };
    
    return this.http.post<MensagemAssistenteResponse>(
      `${this.apiUrl}/chat`,
      body,
      { headers }
    );
  }

  /**
   * Limpa o histórico de conversa do assistente
   */
  limparHistorico(): Observable<{ mensagem: string }> {
    const headers = this.getHeaders();
    return this.http.post<{ mensagem: string }>(
      `${this.apiUrl}/limpar-historico`,
      {},
      { headers }
    );
  }

  /**
   * Obtém os headers com token de autenticação
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }
}

