import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContaRequestModel } from '../models/RequestContas';

@Injectable({
    providedIn: 'root'})


export class ContasService {
    private apiUrl = 'http://localhost:8000/v1/contas';

    constructor(private http: HttpClient) {}

    cadastrarConta(conta: ContaRequestModel): Observable<any> {
        let payload = {
            tipoConta: conta.tipoConta,
            nomeConta: conta.nomeConta
        };
        console.log(payload);

        return this.http.post(this.apiUrl, payload);
    }
}