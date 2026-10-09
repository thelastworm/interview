import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { messageErreur } from '../core/auth.interceptor';
import { Magasin, ROLE_LIBELLE, Role, Utilisateur } from '../core/models';

@Component({
  selector: 'app-utilisateurs',
  imports: [FormsModule],
  template: `
    <h1>{{ auth.isAdmin() ? 'Utilisateurs' : 'Mon équipe — ' + auth.user()?.magasinNom }}</h1>
    @if (erreur()) { <div class="erreur">{{ erreur() }}</div> }

    <div class="carte">
      <h2>{{ auth.isAdmin() ? 'Nouvel utilisateur' : 'Nouveau vendeur' }}</h2>
      <div class="ligne-form">
        <label>Nom complet <input [(ngModel)]="form.nomComplet" /></label>
        <label>Identifiant <input [(ngModel)]="form.username" /></label>
        <label>Mot de passe <input type="password" [(ngModel)]="form.password" placeholder="6 caractères min." /></label>
        @if (auth.isAdmin()) {
          <label>
            Profil
            <select [(ngModel)]="form.role">
              <option value="VENDEUR">Vendeur</option>
              <option value="RESPONSABLE">Responsable</option>
              <option value="ADMIN">Direction</option>
            </select>
          </label>
          @if (form.role !== 'ADMIN') {
            <label>
              Magasin
              <select [(ngModel)]="form.magasinId">
                @for (m of magasins(); track m.id) { <option [ngValue]="m.id">{{ m.nom }}</option> }
              </select>
            </label>
          }
        }
        <button (click)="creer()" [disabled]="!form.nomComplet || !form.username || form.password.length < 6">Créer</button>
      </div>
    </div>

    <div class="carte">
      <table>
        <tr><th>Nom</th><th>Identifiant</th><th>Profil</th><th>Magasin</th><th>Statut</th><th></th></tr>
        @for (u of utilisateurs(); track u.id) {
          <tr>
            <td>{{ u.nomComplet }}</td>
            <td>{{ u.username }}</td>
            <td><span class="badge bleu">{{ libelle[u.role] }}</span></td>
            <td>{{ u.magasinNom ?? '—' }}</td>
            <td><span class="badge" [class.vert]="u.actif" [class.rouge]="!u.actif">{{ u.actif ? 'Actif' : 'Désactivé' }}</span></td>
            <td>
              @if (u.id !== auth.user()?.id && (auth.isAdmin() || u.role === 'VENDEUR')) {
                <button class="secondaire petit" (click)="basculer(u)">{{ u.actif ? 'Désactiver' : 'Réactiver' }}</button>
              }
            </td>
          </tr>
        }
      </table>
    </div>
  `,
})
export class UtilisateursPage {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);
  protected readonly libelle = ROLE_LIBELLE;

  readonly utilisateurs = signal<Utilisateur[]>([]);
  readonly magasins = signal<Magasin[]>([]);
  readonly erreur = signal('');

  form = this.vide();

  constructor() {
    this.charger();
    if (this.auth.isAdmin()) {
      this.api.magasins().subscribe((m) => {
        this.magasins.set(m);
        this.form.magasinId = m[0]?.id ?? null;
      });
    }
  }

  creer(): void {
    const req = { ...this.form, magasinId: this.form.role === 'ADMIN' ? null : this.form.magasinId };
    this.api.creerUtilisateur(req).subscribe({
      next: () => {
        this.erreur.set('');
        this.form = { ...this.vide(), magasinId: this.form.magasinId };
        this.charger();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  basculer(u: Utilisateur): void {
    this.api.activerUtilisateur(u.id, !u.actif).subscribe({
      next: () => this.charger(),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private vide() {
    return { nomComplet: '', username: '', password: '', role: 'VENDEUR' as Role, magasinId: null as number | null };
  }

  private charger(): void {
    this.api.utilisateurs().subscribe((u) => this.utilisateurs.set(u));
  }
}
