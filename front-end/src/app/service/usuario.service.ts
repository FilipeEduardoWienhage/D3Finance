import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioCadastroRequestModel } from '../models/RequestCadastro';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/v1/usuarios`;

  constructor(private http: HttpClient) {}

  cadastrarUsuario(usuario: UsuarioCadastroRequestModel): Observable<any> {
    let payload = {
      name: usuario.nome,
      email: usuario.email,
      senha: usuario.password,
      cpf: usuario.cpf,
      cep: usuario.cep,
      data_nascimento: usuario.dataNascimento
        ? usuario.dataNascimento.toISOString().split('T')[0]
        : null,
      sexo: usuario.selectedSexo ? usuario.selectedSexo.value : null,
      profissao: usuario.cargo,
      cnpj: usuario.cnpj,
      razao_social: usuario.nomeEmpresa,
      estado: usuario.estado.toLowerCase(),
      cidade: usuario.cidade,
      bairro: usuario.bairro,
      usuario: usuario.usuario,
    };
    return this.http.post(this.apiUrl, payload);
  }
}