export class UsuarioCadastroRequestModel {
  nome: string = "";
  email: string = "";
  password: string = "";
  confirmarSenha: string = "";
  cpf: string = "";
  cep: string = "";
  dataNascimento: Date | null = null;
  estado: string = "";
  cidade: string = "";
  bairro: string = "";
  nomeEmpresa: string = "";
  cnpj: string = "";
  usuario: string = "";
  cargo: string = "";
  selectedSexo: { label: string; value: string } | null = null;
}
