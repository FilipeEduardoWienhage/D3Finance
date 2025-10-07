import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContaReceberRequestModel } from '../models/contas-receber';

export interface ContaReceberResponseModel {
  id: number;
  conta_id: number;
  descricao: string;
  valor: number;
  dataPrevista: Date | null;
  formaRecebimento: string;
  status: string;
  categoriaReceita: string;
  dataCriacao: Date | null;
  dataAlteracao: Date | null;
}

@Injectable({ providedIn: 'root' })
export class ContasReceberService {
  private apiUrl = 'http://localhost:8000/v1/contas-receber';

  constructor(private http: HttpClient) {}

  cadastrarContaReceber(conta: ContaReceberRequestModel): Observable<ContaReceberResponseModel> {
    const payload = {
      conta_id: conta.conta_id,
      descricao: conta.descricao,
      valor: conta.valor,
      data_prevista: conta.dataPrevista,
      categoria_receita: conta.categoriaReceita,
      forma_recebimento: conta.formaRecebimento
    };
    
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(response => ({
        id: response.id,
        conta_id: response.conta_id,
        descricao: response.descricao,
        valor: response.valor,
        dataPrevista: response.data_prevista ? new Date(response.data_prevista) : null,
        formaRecebimento: response.forma_recebimento,
        status: response.status,
        categoriaReceita: response.categoria_receita,
        dataCriacao: response.data_criacao ? new Date(response.data_criacao) : null,
        dataAlteracao: response.data_alteracao ? new Date(response.data_alteracao) : null
      }))
    );
  }

  listarContasReceber(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.items || response.data) {
          const items = response.items || response.data || [];
          return {
            items: items.map((item: any) => ({
              id: item.id,
              conta_id: item.conta_id,
              descricao: item.descricao,
              valor: item.valor,
              dataPrevista: item.data_prevista ? new Date(item.data_prevista) : null,
              formaRecebimento: item.forma_recebimento,
              status: item.status === 'Pago' ? 'Recebido' : item.status,
              categoriaReceita: item.categoria_receita,
              dataCriacao: item.data_criacao ? new Date(item.data_criacao) : null,
              dataAlteracao: item.data_alteracao ? new Date(item.data_alteracao) : null
            })),
            total: response.total || response.totalItems || items.length
          };
        }
        return {
          items: response.map((item: any) => ({
            id: item.id,
            conta_id: item.conta_id,
            descricao: item.descricao,
            valor: item.valor,
            dataPrevista: item.data_prevista ? new Date(item.data_prevista) : null,
            formaRecebimento: item.forma_recebimento,
            status: item.status === 'Pago' ? 'Recebido' : item.status,
            categoriaReceita: item.categoria_receita,
            dataCriacao: item.data_criacao ? new Date(item.data_criacao) : null,
            dataAlteracao: item.data_alteracao ? new Date(item.data_alteracao) : null
          })),
          total: response.length
        };
      })
    );
  }

  editarContaReceber(id: number, conta: ContaReceberRequestModel): Observable<ContaReceberResponseModel> {
    const payload = {
      conta_id: conta.conta_id,
      descricao: conta.descricao,
      valor: conta.valor,
      data_prevista: conta.dataPrevista,
      categoria_receita: conta.categoriaReceita,
      forma_recebimento: conta.formaRecebimento
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(response => ({
        id: response.id,
        conta_id: response.conta_id,
        descricao: response.descricao,
        valor: response.valor,
        dataPrevista: response.data_prevista ? new Date(response.data_prevista) : null,
        formaRecebimento: response.forma_recebimento,
        status: response.status,
        categoriaReceita: response.categoria_receita,
        dataCriacao: response.data_criacao ? new Date(response.data_criacao) : null,
        dataAlteracao: response.data_alteracao ? new Date(response.data_alteracao) : null
      }))
    );
  }

  
  deletarContaReceber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  confirmarRecebimento(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/receber`, {});
  }


  exportarContasReceber(filtros: any): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/exportar`, { params: filtros, responseType: 'blob' });
}

}
