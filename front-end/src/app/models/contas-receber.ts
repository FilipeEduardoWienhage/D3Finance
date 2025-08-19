export class ContaReceberRequestModel {
    conta: string = "";
    descricao: string = "";
    valor: number = 0;
    dataPrevista: Date | null = null;
    formaRecebimento: string = "";
    status: string = "";
    categoriaReceita: string = "";
}