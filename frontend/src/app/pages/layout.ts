import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ROLE_LIBELLE } from '../core/models';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside>
      <div class="logo">🚲 VéloGestion</div>
      <nav>
        <a routerLink="/" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: true }">Tableau de bord</a>
        <a routerLink="/stock" routerLinkActive="actif">Stock</a>
        <a routerLink="/ventes" routerLinkActive="actif">Ventes</a>
        @if (auth.isAdmin() || auth.isResponsable()) {
          <a routerLink="/transferts" routerLinkActive="actif">Réapprovisionnement</a>
        }
        @if (auth.peutGererUsine()) {
          <a routerLink="/usine" routerLinkActive="actif">Usine</a>
        }
        <a routerLink="/catalogue" routerLinkActive="actif">Catalogue</a>
        @if (auth.isAdmin() || auth.isResponsable()) {
          <a routerLink="/equipe" routerLinkActive="actif">{{ auth.isAdmin() ? 'Utilisateurs' : 'Mon équipe' }}</a>
        }
      </nav>
      @if (auth.user(); as u) {
        <div class="profil">
          <strong>{{ u.nomComplet }}</strong>
          <span class="badge bleu">{{ libelle[u.role] }}</span>
          <span class="muet">{{ u.magasinNom ?? 'Tous les magasins' }}</span>
          <button class="secondaire petit" (click)="auth.logout()">Déconnexion</button>
        </div>
      }
    </aside>
    <main><router-outlet /></main>
  `,
  styles: `
    :host { display: flex; min-height: 100vh; }
    aside { width: 230px; background: var(--bleu); color: #fff; display: flex; flex-direction: column; padding: 16px 0; flex-shrink: 0; }
    .logo { font-size: 18px; font-weight: 700; padding: 0 20px 20px; }
    nav { display: flex; flex-direction: column; flex: 1; }
    nav a { color: #dbe7f3; text-decoration: none; padding: 10px 20px; }
    nav a:hover { background: rgba(255,255,255,.08); }
    nav a.actif { background: rgba(255,255,255,.18); color: #fff; font-weight: 600; }
    .profil { display: flex; flex-direction: column; gap: 6px; padding: 16px 20px 0; border-top: 1px solid rgba(255,255,255,.2); align-items: flex-start; }
    .profil .muet { color: #b9cde2; font-size: 13px; }
    main { flex: 1; padding: 24px; min-width: 0; }
    @media (max-width: 700px) {
      :host { flex-direction: column; }
      aside { width: 100%; }
      nav { flex-direction: row; flex-wrap: wrap; }
      main { padding: 16px; }
    }
  `,
})
export class Layout {
  protected readonly auth = inject(AuthService);
  protected readonly libelle = ROLE_LIBELLE;
}
