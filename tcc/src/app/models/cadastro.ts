export interface Endereco {
    uf: string;
    localidade: string;
    bairro: string;
  }
  
  export interface Sexo {
    name: string;
    code: string;
  }
  
  export class Usuario {
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
    endereco: Endereco = { uf: '', localidade: '', bairro: '' };
    selectedSexo: Sexo | undefined;
  }