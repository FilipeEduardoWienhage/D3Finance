import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReceitaRequestModel } from '../models/RequestReceitas';

@Injectable({
  providedIn: 'root'})

export class ReceitasService {
    private apiUrl = 'http://localhost:8000/v1/receitas';

    constructor(private http: HttpClient) {}

    cadastrarReceita(receita: ReceitaRequestModel): Observable<any> {
        let payload = {
            categoria: receita.categoria,
            valor_recebido: receita.valor,
            data_recebimento: receita.data ? receita.data.toISOString().split('T')[0] : null,
            forma_recebimento: receita.formaRecebimento,
            conta_id: receita.conta_id,
            descricao: receita.descricao
        };
        console.log(payload);

        return this.http.post(this.apiUrl, payload);
  }
    
  getReceitas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deletarReceita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  atualizarReceita(id: number, receitaAtualizada: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, receitaAtualizada);
  }  

}
