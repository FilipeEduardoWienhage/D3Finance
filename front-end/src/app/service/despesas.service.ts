import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DespesaRequestModel } from '../models/RequestDespesas';

@Injectable({
  providedIn: 'root'})

export class DespesasService {
    private apiUrl = 'http://localhost:8000/v1/despesas';

    constructor(private http: HttpClient) {}

    cadastrarDespesa(despesa: DespesaRequestModel): Observable<any> {
        let payload = {
            categoria: despesa.categoria,
            nome_despesa: despesa.nome,
            valor_pago: despesa.valor,
            data_pagamento: despesa.data ? despesa.data.toISOString().split('T')[0] : null,
            forma_pagamento: despesa.formaPagamento,
            conta: despesa.conta,
            descricao: despesa.descricao
        };
        console.log(payload);

        return this.http.post(this.apiUrl, payload);
    }
}
