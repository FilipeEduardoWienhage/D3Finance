/**
 * Modelos para o Assistente Financeiro
 */

export interface MensagemChat {
  pergunta: string;
  resposta: string;
  queries_executadas: QueryExecutada[];
  usuario_id: number;
  timestamp?: Date;
}

export interface QueryExecutada {
  nome_ferramenta: string;
  query_sql: string;
  parametros: any;
}

export interface PerguntaRequest {
  pergunta: string;
  manter_contexto?: boolean;
}

export interface MensagemAssistenteResponse {
  pergunta: string;
  resposta: string;
  queries_executadas: QueryExecutada[];
  usuario_id: number;
}

