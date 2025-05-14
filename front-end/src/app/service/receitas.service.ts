import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReceitaRequestModel } from '../models/RequestReceitas';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'})

export class ReceitasService {
    private apiUrl = `${environment.apiUrl}/v1/receitas`;

    constructor(private http: HttpClient) {}

    cadastrarReceita(receita: ReceitaRequestModel): Observable<any> {
        let payload = {
            categoria: receita.categoria,
            nome_receita: receita.nome,
            valor_recebido: receita.valor,
            data_recebimento: receita.data ? receita.data.toISOString().split('T')[0] : null,
            forma_recebimento: receita.formaRecebimento,
            conta_id: receita.conta_id,
            descricao: receita.descricao
        };
        console.log(payload);

        return this.http.post(this.apiUrl, payload);
    }
}
