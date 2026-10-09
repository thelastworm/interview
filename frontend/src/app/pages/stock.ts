import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { messageErreur } from '../core/auth.interceptor';
import { Magasin, Stock } from '../core/models';

@Component({
  selector: 'app-stock',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <h1>Stock</h1>
    <div class="ligne-form">
      @if (auth.peutGererUsine()) {
        <label>
          Magasin
          <select [ngModel]="magasinId()" (ngModelChange)="changerMagasin($event)">
            @if (auth.isAdmin()) {
              <option [ngValue]="null">Tous les magasins</option>
            }
            @for (m of magasins(); track m.id) {
              <option [ngValue]="m.id">{{ m.nom }}</option>
            }
          </select>
        </label>
      } @else {
        <p class="muet">{{ auth.user()?.magasinNom }}</p>
      }
      <label>Recherche <input [ngModel]="filtre()" (ngModelChange)="filtre.set($event)" placeholder="Nom ou référence" /></label>
      <label>
        Type
        <select [ngModel]="type()" (ngModelChange)="type.set($event)">
          <option value="">Tous</option>
          <option value="VELO">Vélos</option>
          <option value="PIECE">Pièces détachées</option>
        </select>
      </label>
    </div>
    @if (erreur()) {
      <div class="erreur">{{ erreur() }}</div>
    }
    <div class="carte">
      <table>
        <tr>
          @if (magasinId() === null) { <th>Magasin</th> }
          <th>Référence</th><th>Produit</th><th>Type</th><th class="num">Prix</th>
          <th class="num">Quantité</th><th class="num">Seuil d'alerte</th>
        </tr>
        @for (s of affiches(); track s.id) {
          <tr>
            @if (magasinId() === null) { <td>{{ s.magasinNom }}</td> }
            <td>{{ s.produitReference }}</td>
            <td>{{ s.produitNom }}</td>
            <td><span class="badge" [class.bleu]="s.produitType === 'VELO'">{{ s.produitType === 'VELO' ? 'Vélo' : 'Pièce' }}</span></td>
            <td class="num">{{ s.prixVente | currency: 'EUR' }}</td>
            <td class="num"><span class="badge" [class.rouge]="s.stockBas" [class.vert]="!s.stockBas">{{ s.quantite }}</span></td>
            <td class="num">
              @if (peutModifierSeuil(s)) {
                <input type="number" min="0" class="seuil" [ngModel]="s.seuilAlerte" (change)="modifierSeuil(s, $any($event.target).value)" />
              } @else {
                {{ s.seuilAlerte }}
              }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="muet">Aucun article.</td></tr>
        }
      </table>
    </div>
  `,
  styles: `.seuil { width: 70px; text-align: right; }`,
})
export class StockPage {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly magasins = signal<Magasin[]>([]);
  readonly stocks = signal<Stock[]>([]);
  readonly magasinId = signal<number | null>(this.auth.user()?.magasinId ?? null);
  readonly filtre = signal('');
  readonly type = signal('');
  readonly erreur = signal('');

  readonly affiches = computed(() => {
    const f = this.filtre().toLowerCase();
    return this.stocks().filter(
      (s) =>
        (!this.type() || s.produitType === this.type()) &&
        (s.produitNom.toLowerCase().includes(f) || s.produitReference.toLowerCase().includes(f)),
    );
  });

  constructor() {
    if (this.auth.peutGererUsine()) {
      this.api.magasins().subscribe((m) => this.magasins.set(m));
    }
    this.charger();
  }

  changerMagasin(id: number | null): void {
    this.magasinId.set(id);
    this.charger();
  }

  peutModifierSeuil(s: Stock): boolean {
    const u = this.auth.user();
    return !!u && (u.role === 'ADMIN' || (u.role === 'RESPONSABLE' && u.magasinId === s.magasinId));
  }

  modifierSeuil(s: Stock, valeur: string): void {
    this.api.modifierSeuil(s.id, Number(valeur)).subscribe({
      next: (maj) => this.stocks.update((l) => l.map((x) => (x.id === maj.id ? maj : x))),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private charger(): void {
    this.api.stocks(this.magasinId()).subscribe({
      next: (s) => this.stocks.set(s),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }
}
