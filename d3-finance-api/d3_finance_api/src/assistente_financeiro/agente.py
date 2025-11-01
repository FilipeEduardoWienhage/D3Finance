"""
Agente executor principal do assistente financeiro
"""
import json
from datetime import datetime
from typing import List
from langchain_core.messages import HumanMessage, ToolMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from .llm_setup import get_llm
from .tools import (
    # Despesas
    consultar_despesas_por_mes,
    consultar_despesas_por_ano,
    consultar_despesas_por_categoria,
    consultar_total_despesas,
    # Receitas
    consultar_receitas_por_mes,
    consultar_receitas_por_ano,
    consultar_receitas_por_categoria,
    consultar_total_receitas,
    # Contas
    consultar_saldo_contas,
    consultar_contas_usuario,
    consultar_movimentacoes_conta,
    # Contas a Pagar/Receber
    consultar_contas_pagar,
    consultar_contas_receber,
    consultar_contas_vencidas,
    # Relatórios
    consultar_balanco_mensal,
    consultar_balanco_anual,
    consultar_gastos_por_categoria,
)


class AssistenteFinanceiro:
    """
    Classe principal para interação com o assistente financeiro
    """
    
    def __init__(self, usuario_id: int):
        """
        Inicializa o assistente para um usuário específico
        
        Args:
            usuario_id: ID do usuário no sistema
        """
        self.usuario_id = usuario_id
        self.llm = get_llm()
        
        # Lista todas as ferramentas disponíveis
        self.tools = [
            # Despesas
            consultar_despesas_por_mes,
            consultar_despesas_por_ano,
            consultar_despesas_por_categoria,
            consultar_total_despesas,
            # Receitas
            consultar_receitas_por_mes,
            consultar_receitas_por_ano,
            consultar_receitas_por_categoria,
            consultar_total_receitas,
            # Contas
            consultar_saldo_contas,
            consultar_contas_usuario,
            consultar_movimentacoes_conta,
            # Contas a Pagar/Receber
            consultar_contas_pagar,
            consultar_contas_receber,
            consultar_contas_vencidas,
            # Relatórios
            consultar_balanco_mensal,
            consultar_balanco_anual,
            consultar_gastos_por_categoria,
        ]
        
        # Mapa de ferramentas para execução
        self.tool_map = {tool.name: tool for tool in self.tools}
        
        # LLM com ferramentas vinculadas
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        
        # Prompt do sistema
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("placeholder", "{messages}")
        ])
        
        # Cadeia principal
        self.chain = self.prompt | self.llm_with_tools
        
        # Histórico de mensagens
        self.messages: List = []
        
        # Lista para armazenar queries executadas (para retornar no endpoint)
        self.queries_executadas: List[dict] = []
    
    def _get_system_prompt(self) -> str:
        """
        Retorna o prompt do sistema com instruções para o assistente
        """
        ano_atual = datetime.now().year
        mes_atual = datetime.now().month
        
        return f"""Você é um assistente financeiro para empresas de pequeno porte/pessoal inteligente e prestativo chamado Filipe Luis.
Sua tarefa é ajudar o usuário a entender e gerenciar suas finanças pessoais.

**INFORMAÇÕES IMPORTANTES:**
- A data atual é {datetime.now().strftime('%d de %B de %Y')}
- O usuário tem ID: {self.usuario_id} (use sempre este ID nas consultas)
- Se o usuário perguntar sobre um mês sem especificar o ano, assuma que é o ano atual ({ano_atual})
- Sempre trate valores monetários em Real (R$)

**FERRAMENTAS DISPONÍVEIS:**

1. **Despesas:**
   - consultar_despesas_por_mes: Consulta despesas de um mês específico
   - consultar_despesas_por_ano: Consulta despesas de um ano completo
   - consultar_despesas_por_categoria: Consulta despesas por categoria
   - consultar_total_despesas: Total geral de todas as despesas

2. **Receitas:**
   - consultar_receitas_por_mes: Consulta receitas de um mês específico
   - consultar_receitas_por_ano: Consulta receitas de um ano completo
   - consultar_receitas_por_categoria: Consulta receitas por categoria
   - consultar_total_receitas: Total geral de todas as receitas

3. **Contas Bancárias:**
   - consultar_contas_usuario: Lista todas as contas do usuário
   - consultar_saldo_contas: Consulta saldo de contas
   - consultar_movimentacoes_conta: Consulta movimentações de uma conta

4. **Contas a Pagar/Receber:**
   - consultar_contas_pagar: Consulta contas a pagar
   - consultar_contas_receber: Consulta contas a receber
   - consultar_contas_vencidas: Consulta contas vencidas

5. **Relatórios:**
   - consultar_balanco_mensal: Balanço financeiro mensal (receitas - despesas)
   - consultar_balanco_anual: Balanço financeiro anual
   - consultar_gastos_por_categoria: Gastos agrupados por categoria

**REGRAS DE RESPOSTA:**
- Sempre use o usuario_id {self.usuario_id} em todas as consultas
- Se uma consulta retornar total_gasto/total_receita = 0.0, informe que não foram encontradas movimentações
- Sempre formate valores monetários de forma clara (ex: "R$ 1.234,56")
- Seja claro, objetivo e amigável
- Forneça insights quando apropriado (ex: "Seu saldo ficou negativo, considere revisar seus gastos")
- Se houver erro em uma ferramenta, tente explicar de forma compreensível
"""
    
    def adicionar_contexto_usuario(self, nome_usuario: str = None):
        """
        Adiciona informações de contexto do usuário ao prompt
        
        Args:
            nome_usuario: Nome do usuário (opcional)
        """
        contexto = f"O usuário é {nome_usuario if nome_usuario else f'ID {self.usuario_id}'}."
        if nome_usuario:
            contexto += f" Sempre trate-o com cordialidade e chame-o por '{nome_usuario}' quando apropriado."
        
        # Adiciona ao histórico inicial
        if not self.messages:
            self.messages.append(HumanMessage(content=f"Contexto: {contexto}"))
    
    def perguntar(self, pergunta: str, verbose: bool = True) -> str:
        """
        Faz uma pergunta ao assistente e retorna a resposta
        
        Args:
            pergunta: Pergunta do usuário
            verbose: Se True, imprime informações de debug
            
        Returns:
            Resposta do assistente
        """
        if verbose:
            print(f"\n{'='*60}")
            print(f"--- 👤 USUÁRIO (ID: {self.usuario_id}) ---")
            print(f"{pergunta}\n")
            print(f"{'='*60}\n")
        
        # Adiciona a pergunta do usuário ao histórico
        self.messages.append(HumanMessage(content=pergunta))
        
        # 1ª Chamada: LLM decide qual ferramenta usar
        response = self.chain.invoke({"messages": self.messages})
        self.messages.append(response)
        
        if verbose and response.tool_calls:
            for tool_call in response.tool_calls:
                print(f"--- 💡 LLM decidiu chamar: {tool_call['name']} ---")
                print(f"--- 📥 Argumentos: {tool_call['args']} ---")
        
        # Verifica se o LLM decidiu chamar uma ferramenta
        if response.tool_calls:
            tool_results = []
            
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                
                if tool_name not in self.tool_map:
                    error_msg = f"Ferramenta '{tool_name}' não encontrada"
                    print(f"--- ❌ ERRO: {error_msg} ---")
                    tool_results.append(
                        ToolMessage(
                            content=json.dumps({"erro": error_msg}),
                            tool_call_id=tool_call["id"]
                        )
                    )
                    continue
                
                # Garante que usuario_id está presente nos argumentos
                args = tool_call["args"].copy()
                if "usuario_id" not in args:
                    args["usuario_id"] = self.usuario_id
                
                # Executa a ferramenta
                func = self.tool_map[tool_name]
                try:
                    # Captura a query SQL executada (se disponível)
                    query_info = self._capturar_query_executada(tool_name, args, func)
                    if query_info:
                        self.queries_executadas.append(query_info)
                    
                    result = func.invoke(args)
                except Exception as e:
                    error_msg = f"Erro ao executar {tool_name}: {str(e)}"
                    print(f"--- ❌ ERRO: {error_msg} ---")
                    result = json.dumps({"erro": error_msg})
                
                tool_results.append(
                    ToolMessage(
                        content=result,
                        tool_call_id=tool_call["id"]
                    )
                )
            
            # Adiciona resultados das ferramentas ao histórico
            self.messages.extend(tool_results)
            
            if verbose:
                print("\n--- 🗣️ Enviando resultados para o LLM formular resposta... ---\n")
            
            # 2ª Chamada: LLM formula a resposta final com base nos resultados
            final_response = self.chain.invoke({"messages": self.messages})
            self.messages.append(final_response)
            
            if verbose:
                print(f"\n{'='*60}")
                print("--- 💬 RESPOSTA DO ASSISTENTE ---")
                print(f"{final_response.content}")
                print(f"{'='*60}\n")
            
            return final_response.content
        else:
            # Resposta simples sem uso de ferramentas
            if verbose:
                print(f"\n{'='*60}")
                print("--- 💬 RESPOSTA DO ASSISTENTE ---")
                print(f"{response.content}")
                print(f"{'='*60}\n")
            
            return response.content
    
    def limpar_historico(self):
        """Limpa o histórico de mensagens"""
        self.messages = []
        self.queries_executadas = []
    
    def _capturar_query_executada(self, tool_name: str, args: dict, func) -> dict:
        """
        Captura informações sobre a query SQL executada
        
        Args:
            tool_name: Nome da ferramenta
            args: Argumentos passados
            func: Função da ferramenta
            
        Returns:
            Dict com informações da query ou None
        """
        try:
            query_sql = self._gerar_query_string(tool_name, args)
            return {
                "nome_ferramenta": tool_name,
                "query_sql": query_sql,
                "parametros": args
            }
        except:
            return None
    
    def _gerar_query_string(self, tool_name: str, args: dict) -> str:
        """
        Gera uma representação da query SQL baseada na ferramenta e argumentos
        Nota: Esta é uma representação aproximada, a query real é executada dentro da ferramenta
        """
        # Mapeamento de ferramentas para templates de query
        query_templates = {
            "consultar_despesas_por_mes": """
                SELECT COALESCE(SUM(valor_pago), 0) AS total_gasto, COUNT(*) AS quantidade
                FROM despesas
                WHERE usuario_id = %s AND MONTH(data_pagamento) = %s AND YEAR(data_pagamento) = %s
            """,
            "consultar_receitas_por_mes": """
                SELECT COALESCE(SUM(valor_recebido), 0) AS total_receita, COUNT(*) AS quantidade
                FROM receitas
                WHERE usuario_id = %s AND MONTH(data_recebimento) = %s AND YEAR(data_recebimento) = %s
            """,
            "consultar_balanco_mensal": """
                SELECT 
                    (SELECT COALESCE(SUM(valor_recebido), 0) FROM receitas WHERE usuario_id = %s AND MONTH(data_recebimento) = %s AND YEAR(data_recebimento) = %s) AS receitas,
                    (SELECT COALESCE(SUM(valor_pago), 0) FROM despesas WHERE usuario_id = %s AND MONTH(data_pagamento) = %s AND YEAR(data_pagamento) = %s) AS despesas
            """,
        }
        
        # Remove espaços em branco excessivos e formata
        template = query_templates.get(tool_name, f"-- Query para {tool_name}")
        return " ".join(template.split())
    
    def get_queries_executadas(self) -> List[dict]:
        """
        Retorna a lista de queries executadas na última pergunta
        e limpa a lista para a próxima pergunta
        """
        queries = self.queries_executadas.copy()
        self.queries_executadas = []  # Limpa para próxima pergunta
        return queries

