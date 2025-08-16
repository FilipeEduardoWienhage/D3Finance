import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContaReceberRequestModel } from '../models/contas-receber';

export interface ContaReceberResponseModel {
  id: number;
  conta: string;
  descricao: string;
  valor: number;
  dataPrevista: string | null;
  formaRecebimento: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ContasReceberService {
  private apiUrl = 'http://localhost:8000/v1/contas-receber';

  constructor(private http: HttpClient) {}

  cadastrarContaReceber(conta: ContaReceberRequestModel): Observable<ContaReceberResponseModel> {
    return this.http.post<ContaReceberResponseModel>(this.apiUrl, conta);
  }

  listarContasReceber(): Observable<ContaReceberResponseModel[]> {
    return this.http.get<ContaReceberResponseModel[]>(this.apiUrl);
  }

  // <- id separado
  editarContaReceber(id: number, conta: ContaReceberRequestModel): Observable<ContaReceberResponseModel> {
    return this.http.put<ContaReceberResponseModel>(`${this.apiUrl}/${id}`, conta);
  }

  deletarContaReceber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
