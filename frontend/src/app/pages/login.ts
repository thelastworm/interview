import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { messageErreur } from '../core/auth.interceptor';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="page">
      <form class="carte" (ngSubmit)="connexion()">
        <h1>🚲 VéloGestion</h1>
        <p class="muet">Gestion des magasins et de l'usine</p>
        @if (erreur()) {
          <div class="erreur">{{ erreur() }}</div>
        }
        <label>Identifiant <input name="username" [(ngModel)]="username" required autofocus /></label>
        <label>Mot de passe <input name="password" type="password" [(ngModel)]="password" required /></label>
        <button type="submit" [disabled]="chargement()">Se connecter</button>

        <details>
          <summary>Comptes de démonstration (mot de passe : <code>password</code>)</summary>
          <ul>
            @for (c of comptes; track c[0]) {
              <li><a href="" (click)="$event.preventDefault(); username = c[0]; password = 'password'">{{ c[0] }}</a> — {{ c[1] }}</li>
            }
          </ul>
        </details>
      </form>
    </div>
  `,
  styles: `
    .page { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
    form { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 12px; }
    h1 { margin: 0; }
    p { margin: 0 0 8px; }
    details { font-size: 13px; margin-top: 8px; }
    ul { padding-left: 18px; margin: 8px 0 0; }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly erreur = signal('');
  readonly chargement = signal(false);

  readonly comptes = [
    ['admin', 'Direction (tous les magasins)'],
    ['resp.central', 'Responsable du magasin central / usine'],
    ['vend.central', 'Vendeur du magasin central'],
    ['resp.paris', 'Responsable Paris'],
    ['vend.paris1', 'Vendeur Paris'],
    ['resp.marseille', 'Responsable Marseille'],
    ['resp.bordeaux', 'Responsable Bordeaux'],
  ];

  connexion(): void {
    this.chargement.set(true);
    this.erreur.set('');
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => {
        this.erreur.set(e.status === 401 ? 'Identifiant ou mot de passe incorrect' : messageErreur(e));
        this.chargement.set(false);
      },
    });
  }
}
