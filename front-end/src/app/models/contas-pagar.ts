export class ContaPagarRequestModel {
    id?: number;
    conta_id: number = 0;
    descricao: string = "";
    valor: number = 0;
    dataVencimento: Date | string | null = null;
    formaRecebimento: string = "";
    status: string = "";
    categoriaDespesa: string = "";
}