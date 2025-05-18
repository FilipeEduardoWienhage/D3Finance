import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransacaoRequestModel } from '../models/RequestTransacao';


@Injectable({
    providedIn: 'root'
})
export class TransacaoService {
    private apiUrl = 'http://localhost:8000/v1/transacoes';

    constructor(private http: HttpClient) { }

    cadastrarTransacao(transacao: TransacaoRequestModel): Observable<any> {
        let payload = {
            conta_origem_id: transacao.conta_origem_id,
            conta_destino_id: transacao.conta_destino_id,
            valor: transacao.valor
        };
        console.log(payload);
        return this.http.post(this.apiUrl, payload);
    }
}