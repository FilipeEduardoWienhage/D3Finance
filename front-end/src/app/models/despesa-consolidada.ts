export class DespesaConsolidada {
    constructor(
        // O backend envia o mês como um número (1 para Janeiro, 2 para Fevereiro, etc.)
        public mes: number,
        public valor: number
        // A categoria não vem mais neste objeto consolidado, pois o filtro é feito no backend
    ) { }
}