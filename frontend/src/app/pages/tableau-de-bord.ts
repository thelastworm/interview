import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Stock, TableauDeBord } from '../core/models';

@Component({
  selector: 'app-tableau-de-bord',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <h1>Bonjour {{ auth.user()?.nomComplet }}</h1>
    @if (kpi(); as k) {
      <div class="kpis">
        <div class="carte"><span>Ventes</span><strong>{{ k.nombreVentes }}</strong></div>
        <div class="carte"><span>Chiffre d'affaires</span><strong>{{ k.chiffreAffaires | currency: 'EUR' }}</strong></div>
        <div class="carte"><span>Articles en stock</span><strong>{{ k.articlesEnStock }}</strong></div>
        <div class="carte"><span>Stocks bas</span><strong [class.alerte]="k.stocksBas > 0">{{ k.stocksBas }}</strong></div>
        @if (auth.isAdmin() || auth.isResponsable()) {
          <div class="carte"><span>Transferts en attente</span><strong>{{ k.transfertsEnAttente }}</strong></div>
        }
      </div>
    }
    <div class="carte">
      <h2>Alertes de stock</h2>
      @if (alertes().length === 0) {
        <p class="muet">Aucun produit sous le seuil d'alerte.</p>
      } @else {
        <table>
          <tr><th>Magasin</th><th>Produit</th><th class="num">Quantité</th><th class="num">Seuil</th></tr>
          @for (s of alertes(); track s.id) {
            <tr>
              <td>{{ s.magasinNom }}</td>
              <td>{{ s.produitNom }}</td>
              <td class="num"><span class="badge rouge">{{ s.quantite }}</span></td>
              <td class="num">{{ s.seuilAlerte }}</td>
            </tr>
          }
        </table>
        @if (auth.isResponsable() && !auth.peutGererUsine()) {
          <p><a routerLink="/transferts">→ Demander un réapprovisionnement à l'usine</a></p>
        }
      }
    </div>
  `,
  styles: `
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .kpis .carte { display: flex; flex-direction: column; gap: 6px; }
    .kpis span { color: var(--gris); }
    .kpis strong { font-size: 24px; color: var(--bleu); }
    .kpis strong.alerte { color: var(--rouge); }
  `,
})
export class TableauDeBordPage {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly kpi = signal<TableauDeBord | null>(null);
  private readonly stocks = signal<Stock[]>([]);
  readonly alertes = computed(() => this.stocks().filter((s) => s.stockBas));

  constructor() {
    this.api.tableauDeBord().subscribe((k) => this.kpi.set(k));
    this.api.stocks().subscribe((s) => this.stocks.set(s));
  }
}
