// /src/site/d3-finance/src/app/service/despesas.service.ts (Versão final limpa)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DespesaRequestModel } from '../models/RequestDespesas';
import { DespesaConsolidada } from '../models/despesa-consolidada';
@Injectable({
  providedIn: 'root'
})
export class DespesasService {
  private apiUrl = 'http://localhost:8000/v1/despesas';

  constructor(private http: HttpClient) { }

  // Função principal para buscar dados do gráfico
  getDespesasConsolidadas(filtros?: any): Observable<DespesaConsolidada[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.ano) {
        params = params.append('ano', filtros.ano);
      }
      if (filtros.mes) {
        params = params.append('mes', filtros.mes);
      }
    }
    // A URL agora é a rota principal /consolidado
    const url = `${this.apiUrl}/consolidado`;
    return this.http.get<DespesaConsolidada[]>(url, { params });
  }

  // --- O método antigo getDespesasConsolidadasPorCategoria foi removido/renomeado ---

  cadastrarDespesa(despesa: DespesaRequestModel): Observable<any> {
    // ... código sem alterações ...
    let payload = {
      categoria: despesa.categoria,
      valor_pago: despesa.valor_pago,
      data_pagamento: despesa.data_pagamento ? despesa.data_pagamento.toISOString().split('T')[0] : null,
      forma_pagamento: despesa.forma_pagamento,
      conta_id: despesa.conta_id,
      descricao: despesa.descricao
    };
    return this.http.post(this.apiUrl, payload);
  }

  getDespesas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deletarDespesa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  editarDespesa(conta: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${conta.id}`, conta);
  }
}