import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContaRequestModel } from '../models/RequestContas';

export interface ContaResponseModel {
    id: number;
    nome_conta: string;
    tipo_conta: string;
    saldo: number;
}

@Injectable({
    providedIn: 'root'
})


export class ContasService {
    private apiUrl = 'http://localhost:8000/v1/contas';

    constructor(private http: HttpClient) { }

    cadastrarConta(conta: ContaRequestModel): Observable<any> {
        let payload = {
            tipo_conta: conta.tipoConta,
            nome_conta: conta.nomeConta
        };
        console.log(payload);

        return this.http.post(this.apiUrl, payload);
    }


    deletarConta(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }


    listarContas(): Observable<ContaResponseModel[]> {
        return this.http.get<ContaResponseModel[]>(this.apiUrl);
    }

    getContas() {
        return this.http.get<any[]>(this.apiUrl);
    }


    editarConta(conta: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${conta.id}`, conta);
    }
}

