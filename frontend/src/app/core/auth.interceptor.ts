import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Ajoute le jeton JWT aux appels API et déconnecte l'utilisateur si le jeton est refusé. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const requete = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(requete).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/auth/login')) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};

/** Extrait le message d'erreur d'une réponse ProblemDetail du backend. */
export function messageErreur(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return err.error?.detail ?? err.message;
  }
  return String(err);
}
