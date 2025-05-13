import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContaRequestModel } from '../models/RequestContas';
import { environment } from '../../environments/environment';

export interface ContaResponseModel {
    id: number;
    nome_conta: string;
}

@Injectable({
    providedIn: 'root'})


export class ContasService {
    private apiUrl = `${environment.apiUrl}/v1/contas`;

    constructor(private http: HttpClient) {}

    cadastrarConta(conta: ContaRequestModel): Observable<any> {
        let payload = {
            tipo_conta: conta.tipoConta,
            nome_conta: conta.nomeConta
        };
        console.log(payload);

        return this.http.post(this.apiUrl, payload);
    }

    listarContas(): Observable<ContaResponseModel[]> {
        return this.http.get<ContaResponseModel[]>(this.apiUrl);
    }
}

