import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnviarCodigoRequest {
  email: string;
}

export interface EnviarCodigoResponse {
  message: string;
  success: boolean;
}

export interface ValidarCodigoRequest {
  email: string;
  codigo: string;
}

export interface ValidarCodigoResponse {
  message: string;
  success: boolean;
  token?: string;
}

export interface AlterarSenhaRequest {
  email: string;
  codigo: string;
  nova_senha: string;
}

export interface AlterarSenhaResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RecuperacaoService {
  private apiUrl = 'http://localhost:8000/v1/recuperar-senha';

  constructor(private http: HttpClient) { }

  enviarCodigo(request: EnviarCodigoRequest): Observable<EnviarCodigoResponse> {
    return this.http.post<EnviarCodigoResponse>(`${this.apiUrl}/enviar-codigo`, request);
  }

  validarCodigo(request: ValidarCodigoRequest): Observable<ValidarCodigoResponse> {
    return this.http.post<ValidarCodigoResponse>(`${this.apiUrl}/validar-codigo`, request);
  }

  alterarSenha(request: AlterarSenhaRequest): Observable<AlterarSenhaResponse> {
    return this.http.post<AlterarSenhaResponse>(`${this.apiUrl}/alterar-senha`, request);
  }
}