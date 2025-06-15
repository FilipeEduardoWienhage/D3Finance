import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.prod';


export interface LoginResponse {
  access: string;
  refresh: string;
}

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) {}

  autenticar(login: string, senha: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${apiUrl}/autenticacao/`, { usuario: login, senha: senha });
  }

  salvarToken(access: string, refresh: string): void {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('access');
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }
}