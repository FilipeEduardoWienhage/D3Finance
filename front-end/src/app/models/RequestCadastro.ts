// export interface Endereco {
//     uf: string;
//     localidade: string;
//     bairro: string;
//   }
  
//   export interface Sexo {
//     name: string;
//     code: string;
//   }


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
  selectedSexo: { label: string; value: string } = { label: '', value: '' };
}
