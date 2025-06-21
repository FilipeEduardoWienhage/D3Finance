import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const token = authService.getToken();

  const rotasPublicas = [
    '/v1/autenticacao', 
    '/v1/usuarios'      
  ];

  const isRotaPublica = rotasPublicas.some(rota => req.url.includes(rota));

  if (token && !isRotaPublica) {
    const clonaRequisicao = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonaRequisicao);
  }

  return next(req);
};
