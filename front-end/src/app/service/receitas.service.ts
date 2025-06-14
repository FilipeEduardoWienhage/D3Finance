// /src/site/d3-finance/src/app/service/receitas.service.ts (Versão final limpa)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReceitaRequestModel } from '../models/RequestReceitas';
import { ReceitaConsolidada } from '../models/receita-consolidada';
import { ReceitaMensal } from '../models/receita-mensal';

@Injectable({
  providedIn: 'root'
})
export class ReceitasService {
  private apiUrl = 'http://localhost:8000/v1/receitas';

  constructor(private http: HttpClient) { }

  getReceitasConsolidadas(filtros?: any): Observable<ReceitaConsolidada[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.ano) {
        params = params.append('ano', filtros.ano);
      }
      if (filtros.mes) {
        params = params.append('mes', filtros.mes);
      }
    }
    const url = `${this.apiUrl}/consolidado`;
    return this.http.get<ReceitaConsolidada[]>(url, { params });
  }


  getReceitasConsolidadasMensal(filtros?: any): Observable<ReceitaMensal[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.ano) params = params.append('ano', filtros.ano);
      if (filtros.categoria) params = params.append('categoria', filtros.categoria);
    }
    const url = `${this.apiUrl}/consolidado/mensal`;
    return this.http.get<ReceitaMensal[]>(url, { params });
  }


  cadastrarReceita(receita: ReceitaRequestModel): Observable<any> {
    let payload = {
      categoria: receita.categoria,
      valor_recebido: receita.valor,
      data_recebimento: receita.data ? receita.data.toISOString().split('T')[0] : null,
      forma_recebimento: receita.formaRecebimento,
      conta_id: receita.conta_id,
      descricao: receita.descricao
    };
    return this.http.post<any>(this.apiUrl, payload);
  }

  getReceitas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deletarReceita(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  editarReceita(receita: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${receita.id}`, receita);
  }
}