import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiCall = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api');
  if (!isApiCall) return next(req);

  const keycloak = inject(KeycloakService);

  return from(keycloak.getToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authReq);
    }),
  );
};
