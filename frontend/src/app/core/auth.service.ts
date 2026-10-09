import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, Utilisateur } from './models';

const TOKEN_KEY = 'velo.token';
const USER_KEY = 'velo.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<Utilisateur | null>(lire());
  readonly user = this._user.asReadonly();
  readonly connecte = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isResponsable = computed(() => this._user()?.role === 'RESPONSABLE');
  /** Direction ou responsable du magasin central : fournisseurs, commandes, assemblage, transferts. */
  readonly peutGererUsine = computed(() => {
    const u = this._user();
    return !!u && (u.role === 'ADMIN' || (u.role === 'RESPONSABLE' && u.magasinCentral));
  });
  readonly peutVendre = computed(() => {
    const u = this._user();
    return !!u && u.role !== 'ADMIN';
  });

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { username, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.utilisateur));
        this._user.set(res.utilisateur);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}

function lire(): Utilisateur | null {
  const brut = localStorage.getItem(USER_KEY);
  return brut && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(brut) as Utilisateur) : null;
}
