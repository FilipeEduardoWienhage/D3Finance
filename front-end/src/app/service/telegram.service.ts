import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.prod';

export interface TelegramConfigRequest {
    chat_id: string;
}

export interface TelegramConfigUpdateRequest {
    chat_id?: string;
    ativo?: boolean;
}

export interface TelegramConfigResponse {
    id: number;
    usuario_id: number;
    chat_id: string;
    ativo: boolean;
    data_criacao: string;
    data_alteracao?: string;
}

export interface TelegramTestMessageRequest {
    message: string;
}

export interface TelegramNotificationResponse {
    success: boolean;
    message: string;
    sent_at: string;
}

export interface TelegramConfig {
    id?: number;
    usuario_id: number;
    chat_id: string;
    ativo: boolean;
    data_criacao?: string;
    data_atualizacao?: string;
}

export interface TelegramTestMessage {
    message?: string;
}

export interface ChatIdResponse {
    success: boolean;
    chat_id?: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class TelegramService {
    private apiUrl = `${environment.apiUrl}/telegram`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Criar configuração do Telegram
    createConfig(config: TelegramConfigRequest): Observable<TelegramConfigResponse> {
        return this.http.post<TelegramConfigResponse>(`${this.apiUrl}/config`, config);
    }

    // Obter configuração atual
    getConfig(): Observable<TelegramConfigResponse> {
        return this.http.get<TelegramConfigResponse>(`${this.apiUrl}/config`);
    }

    // Atualizar configuração
    updateConfig(config: TelegramConfigUpdateRequest): Observable<TelegramConfigResponse> {
        return this.http.put<TelegramConfigResponse>(`${this.apiUrl}/config`, config);
    }

    // Deletar configuração
    deleteConfig(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/config`);
    }

    // Enviar mensagem de teste
    sendTestMessage(message: TelegramTestMessageRequest): Observable<TelegramNotificationResponse> {
        return this.http.post<TelegramNotificationResponse>(`${this.apiUrl}/test`, message);
    }

    configurarTelegram(config: TelegramConfig): Observable<TelegramConfig> {
        return this.http.post<TelegramConfig>(`${this.apiUrl}/config`, config, { headers: this.getHeaders() });
    }

    obterConfiguracao(): Observable<TelegramConfig | null> {
        return this.http.get<TelegramConfig | null>(`${this.apiUrl}/config`, { headers: this.getHeaders() });
    }

    enviarMensagemTeste(testMessage: TelegramTestMessage): Observable<any> {
        return this.http.post(`${this.apiUrl}/test`, testMessage, { headers: this.getHeaders() });
    }

    removerConfiguracao(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/config`, { headers: this.getHeaders() });
    }
} 