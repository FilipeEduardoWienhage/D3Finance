import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DespesaRequestModel } from '../models/RequestDespesas';
import { DespesaConsolidada } from '../models/despesa-consolidada';

@Injectable({
  providedIn: 'root'
})

export class DespesasService {
  private apiUrl = 'http://localhost:8000/v1/despesas';

  constructor(private http: HttpClient) { }

  cadastrarDespesa(despesa: DespesaRequestModel): Observable<any> {
    let payload = {
      categoria: despesa.categoria,
      valor_pago: despesa.valor_pago,
      data_pagamento: despesa.data_pagamento ? despesa.data_pagamento.toISOString().split('T')[0] : null,
      forma_pagamento: despesa.forma_pagamento,
      conta_id: despesa.conta_id,
      descricao: despesa.descricao
    };
    console.log(payload);

    return this.http.post(this.apiUrl, payload);
  }

  getDespesas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDespesasConsolidadas(): Observable<DespesaConsolidada[]> {
    return this.http.get<any[]>(this.apiUrl + "/consolidado");
  }

  deletarDespesa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  editarDespesa(conta: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${conta.id}`, conta);
  }

}
