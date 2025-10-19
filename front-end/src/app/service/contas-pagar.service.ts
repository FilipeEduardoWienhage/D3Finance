import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContaPagarRequestModel } from "../models/contas-pagar";

export interface ContaPagarResponseModel {
  id: number;
  conta_id: number;
  descricao: string;
  valor: number;
  dataVencimento: Date | null;
  formaRecebimento: string;
  status: string;
  categoriaDespesa: string;
  dataCriacao: Date | null;
  dataAlteracao: Date | null
}

@Injectable({ providedIn: 'root' })
export class ContasPagarService {

    private apiUrl = 'http://localhost:8000/v1/contas-pagar';

    constructor(private http: HttpClient) {}

    cadastrarContaPagar(conta: ContaPagarRequestModel): 
    Observable<ContaPagarResponseModel> {
        const payload = {
            conta_id: conta.conta_id,
            descricao: conta.descricao,
            valor: conta.valor,
            data_vencimento: conta.dataVencimento,
            categoria_despesa: conta.categoriaDespesa,
            // backend espera forma_pagamento
            forma_pagamento: conta.formaRecebimento
        };

        return this.http.post<any>(this.apiUrl, payload).pipe(
            map(response => ({
            id: response.id,
            conta_id: response.conta_id,
            descricao: response.descricao,
            valor: response.valor,
            dataVencimento: response.data_vencimento ? new Date(response.data_vencimento) : null,
            // backend responde forma_pagamento
            formaRecebimento: response.forma_pagamento,
            status: response.status,
            categoriaDespesa: response.categoria_despesa,
            dataCriacao: response.data_criacao ? new Date(response.data_criacao) : null,
            dataAlteracao: response.data_alteracao ? new Date(response.data_alteracao) : null
            }))
        );
    }

    listarContasPagar(params?: any): Observable<any> {
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                if (response.items || response.data) {
                    const items = response.items || response.data || [];
                    return {
                        items: items.map((item: any) => ({
                            id: item.id,
                            conta_id: item.conta_id,
                            descricao: item.descricao,
                            valor: item.valor,
                            dataVencimento: item.data_vencimento ? new Date(item.data_vencimento) : null,
                            formaRecebimento: item.forma_pagamento,
                            status: item.status === 'Pago' ? 'Pago' : item.status,
                            categoriaDespesa: item.categoria_despesa,
                            dataCriacao: item.data_criacao ? new Date(item.data_criacao) : null,
                            dataAlteracao: item.data_alteracao ? new Date(item.data_alteracao) : null
                        })),
                        total: response.total || response.totalItems || items.length
                    };
                }
                return {
                    items: response.map((item: any) => ({
                        id: item.id,
                        conta_id: item.conta_id,
                        descricao: item.descricao,
                        valor: item.valor,
                        dataVencimento: item.data_vencimento ? new Date(item.data_vencimento) : null,
                        formaRecebimento: item.forma_pagamento,
                        status: item.status === 'Pago' ? 'Pago' : item.status,
                        categoriaDespesa: item.categoria_despesa,
                        dataCriacao: item.data_criacao ? new Date(item.data_criacao) : null,
                        dataAlteracao: item.data_alteracao ? new Date(item.data_alteracao) : null
                    })),
                    total: response.length
                };
            })
        );
    }

    editarContaPagar(id: number, conta: ContaPagarRequestModel): 
    Observable<ContaPagarResponseModel> {
        const payload = {
            conta_id: conta.conta_id,
            descricao: conta.descricao,
            valor: conta.valor,
            data_vencimento: conta.dataVencimento,
            categoria_despesa: conta.categoriaDespesa,
            forma_pagamento: conta.formaRecebimento
        };

        return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
            map(response => ({
                id: response.id,
                conta_id: response.conta_id,
                descricao: response.descricao,
                valor: response.valor,
                dataVencimento: response.data_vencimento ? new Date(response.data_vencimento) : null,
                formaRecebimento: response.forma_pagamento,
                status: response.status,
                categoriaDespesa: response.categoria_despesa,
                dataCriacao: response.data_criacao ? new Date(response.data_criacao) : null,
                dataAlteracao: response.data_alteracao ? new Date(response.data_alteracao) : null
            }))
        );
    }

    deletarContaPagar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    confirmarPagamento(id: number): Observable<ContaPagarResponseModel> {
        return this.http.put<any>(`${this.apiUrl}/${id}/pagar`, {}).pipe(
            map(response => ({
                id: response.id,
                conta_id: response.conta_id,
                descricao: response.descricao,
                valor: response.valor,
                dataVencimento: response.data_vencimento ? new Date(response.data_vencimento) : null,
                formaRecebimento: response.forma_pagamento,
                status: response.status,
                categoriaDespesa: response.categoria_despesa,
                dataCriacao: response.data_criacao ? new Date(response.data_criacao) : null,
                dataAlteracao: response.data_alteracao ? new Date(response.data_alteracao) : null
            }))
        );
    }
    
    exportarContasPagar(filtros?: any): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/exportar`, {
            params: filtros,
            responseType: 'blob'
        });
    }
}