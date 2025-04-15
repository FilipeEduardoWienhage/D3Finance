import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestCadastro } from '../models/RequestCadastro';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CadastroService {
  private apiUrl = 'http://localhost:8000/cadastro'; // verificar com professor

  constructor(private http: HttpClient) {}

  cadastrarUsuario(data: RequestCadastro): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}