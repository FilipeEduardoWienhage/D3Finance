import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.prod';

export interface CategoriaValor {
  categoria: string;
  valor: number;
}

export interface ContaValor {
  conta: string;
  valor: number;
}


export interface DadosMensais {
  mes: number;
  receitas: number;
  despesas: number;
  saldo_periodo: number;
}

export interface RelatorioMensal {
  periodo_inicio: string;
  periodo_fim: string;
  total_receitas: number;
  total_despesas: number;
  saldo_periodo: number;
  receitas_por_categoria: CategoriaValor[];
  despesas_por_categoria: CategoriaValor[];
  receitas_por_conta: ContaValor[];
  despesas_por_conta: ContaValor[];
  quantidade_receitas: number;
  quantidade_despesas: number;
}

export interface RelatorioAnual {
  ano: number;
  total_receitas: number;
  total_despesas: number;
  saldo_periodo: number;
  dados_mensais: DadosMensais[];
  receitas_por_conta: ContaValor[];
  despesas_por_conta: ContaValor[];
}

export interface OrcadoRealizadoMensal {
  mes: number;
  orcado: number;
  realizado: number;
  diferenca: number;
}

export interface OrcadoRealizadoResponse {
  ano: number;
  total_orcado: number;
  total_realizado: number;
  total_diferenca: number;
  dados_mensais: OrcadoRealizadoMensal[];
}


@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Relatório Mensal
  getRelatorioMensal(ano: number, mes: number): Observable<RelatorioMensal> {
    const params = new HttpParams()
      .set('ano', ano.toString())
      .set('mes', mes.toString());

    return this.http.get<RelatorioMensal>(`${this.apiUrl}/relatorios/mensal`, { params });
  }

  // Relatório Anual
  getRelatorioAnual(ano: number): Observable<RelatorioAnual> {
    const params = new HttpParams().set('ano', ano.toString());

    return this.http.get<RelatorioAnual>(`${this.apiUrl}/relatorios/anual`, { params });
  }

  // Orçado x Realizado - Receitas
  getOrcadoRealizado(ano: number, mes?: number, categoria?: string): Observable<OrcadoRealizadoResponse> {
    let params = new HttpParams().set('ano', ano.toString());
    
    if (mes) {
      params = params.set('mes', mes.toString());
    }
    
    if (categoria) {
      params = params.set('categoria', categoria);
    }

    return this.http.get<OrcadoRealizadoResponse>(`${this.apiUrl}/orcado-realizado`, { params });
  }

  // Orçado x Realizado - Despesas
  getOrcadoRealizadoDespesas(ano: number, mes?: number, categoria?: string): Observable<OrcadoRealizadoResponse> {
    let params = new HttpParams().set('ano', ano.toString());
    
    if (mes) {
      params = params.set('mes', mes.toString());
    }
    
    if (categoria) {
      params = params.set('categoria', categoria);
    }

    return this.http.get<OrcadoRealizadoResponse>(`${this.apiUrl}/orcado-realizado-despesas`, { params });
  }

}
