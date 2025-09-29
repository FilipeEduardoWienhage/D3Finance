export class ContaReceberRequestModel {
    id?: number;
    conta_id: number = 0;
    descricao: string = "";
    valor: number = 0;
    dataPrevista: Date | string | null = null;
    formaRecebimento: string = "";
    status: string = "";
    categoriaReceita: string = "";
}