import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';
import { environment } from '../environment/environment.prod';

const apiUrl = environment.apiUrl;

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const autenticacaoService: AuthService = inject(AuthService);
  const token = autenticacaoService.getToken();
  const isUsuario = `${apiUrl}/usuarios` == req.url;

  if(token && isUsuario == false){
    const clonaRequisicao = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next(clonaRequisicao);
  }

  return next(req);
};