import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.connecte() || inject(Router).createUrlTree(['/login']);
};

export const usineGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.peutGererUsine() || inject(Router).createUrlTree(['/']);
};

export const responsableGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin() || auth.isResponsable() || inject(Router).createUrlTree(['/']);
};
