// /src/site/d3-finance/src/app/service/despesas.service.ts (Versão final limpa)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DespesaRequestModel } from '../models/RequestDespesas';
import { DespesaConsolidada } from '../models/despesa-consolidada';
import { DespesaMensal } from '../models/despesa-mensal';
@Injectable({
  providedIn: 'root'
})
export class DespesasService {
  private apiUrl = 'http://localhost:8000/v1/despesas';

  constructor(private http: HttpClient) { }

  getDespesasConsolidadas(filtros?: any): Observable<DespesaConsolidada[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.ano) {
        params = params.append('ano', filtros.ano);
      }
      if (filtros.mes) {
        params = params.append('mes', filtros.mes);
      }
      if (filtros.categoria) {
        params = params.append('categoria', filtros.categoria);
      }
      if (filtros.conta_id) {
        params = params.append('conta_id', filtros.conta_id);
      }
      if (filtros.forma_pagamento) {
        params = params.append('forma_pagamento', filtros.forma_pagamento);
      }
    }
    const url = `${this.apiUrl}/consolidado`;
    return this.http.get<DespesaConsolidada[]>(url, { params });
  }

  getDespesaConsolidadasMensal(filtros?: any): Observable<DespesaMensal[]> {
      let params = new HttpParams();
      if (filtros) {
        if (filtros.ano) params = params.append('ano', filtros.ano);
        if (filtros.categoria) params = params.append('categoria', filtros.categoria);
        if (filtros.conta_id) params = params.append('conta_id', filtros.conta_id);
        if (filtros.forma_pagamento) params = params.append('forma_pagamento', filtros.forma_pagamento);
      }
      const url = `${this.apiUrl}/consolidado/mensal`;
      return this.http.get<DespesaMensal[]>(url, { params });
    }


  cadastrarDespesa(despesa: DespesaRequestModel): Observable<any> {
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

  editarDespesa(despesa: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${despesa.id}`, despesa);
  }
}