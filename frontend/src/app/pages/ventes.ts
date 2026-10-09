import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { messageErreur } from '../core/auth.interceptor';
import { Stock, Vente } from '../core/models';

interface LignePanier {
  stock: Stock;
  quantite: number;
}

@Component({
  selector: 'app-ventes',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <h1>Ventes</h1>
    @if (erreur()) { <div class="erreur">{{ erreur() }}</div> }
    @if (message()) { <div class="info">{{ message() }}</div> }

    @if (auth.peutVendre()) {
      <div class="carte">
        <h2>Nouvelle vente — {{ auth.user()?.magasinNom }}</h2>
        <div class="ligne-form">
          <label>
            Produit
            <select [(ngModel)]="stockChoisi">
              <option [ngValue]="null">— Choisir —</option>
              @for (s of disponibles(); track s.id) {
                <option [ngValue]="s">{{ s.produitNom }} ({{ s.prixVente | currency: 'EUR' }}) — {{ s.quantite }} en stock</option>
              }
            </select>
          </label>
          <label>Quantité <input type="number" min="1" [(ngModel)]="quantite" style="width: 90px" /></label>
          <button class="secondaire" (click)="ajouter()" [disabled]="!stockChoisi || quantite < 1">Ajouter</button>
        </div>
        @if (panier().length) {
          <table>
            <tr><th>Produit</th><th class="num">Prix</th><th class="num">Qté</th><th class="num">Sous-total</th><th></th></tr>
            @for (l of panier(); track l.stock.id; let i = $index) {
              <tr>
                <td>{{ l.stock.produitNom }}</td>
                <td class="num">{{ l.stock.prixVente | currency: 'EUR' }}</td>
                <td class="num">{{ l.quantite }}</td>
                <td class="num">{{ l.stock.prixVente * l.quantite | currency: 'EUR' }}</td>
                <td><button class="danger petit" (click)="retirer(i)">✕</button></td>
              </tr>
            }
            <tr><th colspan="3">Total</th><th class="num">{{ total() | currency: 'EUR' }}</th><th></th></tr>
          </table>
          <div class="ligne-form" style="margin-top: 12px">
            <label>Client <input [(ngModel)]="client" placeholder="Nom du client (facultatif)" /></label>
            <button class="succes" (click)="valider()">Valider la vente</button>
          </div>
        }
      </div>
    }

    <div class="carte">
      <h2>Historique</h2>
      <table>
        <tr><th>N°</th><th>Date</th><th>Magasin</th><th>Vendeur</th><th>Client</th><th>Articles</th><th class="num">Total</th></tr>
        @for (v of ventes(); track v.id) {
          <tr>
            <td>{{ v.id }}</td>
            <td>{{ v.date | date: 'short' }}</td>
            <td>{{ v.magasinNom }}</td>
            <td>{{ v.vendeur }}</td>
            <td>{{ v.client || '—' }}</td>
            <td>
              @for (l of v.lignes; track $index) { <div>{{ l.quantite }} × {{ l.produitNom }}</div> }
            </td>
            <td class="num">{{ v.total | currency: 'EUR' }}</td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="muet">Aucune vente.</td></tr>
        }
      </table>
    </div>
  `,
})
export class VentesPage {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly ventes = signal<Vente[]>([]);
  readonly stocks = signal<Stock[]>([]);
  readonly panier = signal<LignePanier[]>([]);
  readonly erreur = signal('');
  readonly message = signal('');
  readonly disponibles = computed(() => this.stocks().filter((s) => s.quantite > 0));
  readonly total = computed(() => this.panier().reduce((t, l) => t + l.stock.prixVente * l.quantite, 0));

  stockChoisi: Stock | null = null;
  quantite = 1;
  client = '';

  constructor() {
    this.charger();
  }

  ajouter(): void {
    const s = this.stockChoisi!;
    const dejaAuPanier = this.panier().find((l) => l.stock.id === s.id)?.quantite ?? 0;
    if (dejaAuPanier + this.quantite > s.quantite) {
      this.erreur.set(`Stock insuffisant : ${s.quantite} « ${s.produitNom} » disponible(s)`);
      return;
    }
    this.erreur.set('');
    this.panier.update((p) =>
      dejaAuPanier
        ? p.map((l) => (l.stock.id === s.id ? { ...l, quantite: l.quantite + this.quantite } : l))
        : [...p, { stock: s, quantite: this.quantite }],
    );
    this.stockChoisi = null;
    this.quantite = 1;
  }

  retirer(index: number): void {
    this.panier.update((p) => p.filter((_, i) => i !== index));
  }

  valider(): void {
    const req = {
      client: this.client,
      lignes: this.panier().map((l) => ({ produitId: l.stock.produitId, quantite: l.quantite })),
    };
    this.api.vendre(req).subscribe({
      next: (v) => {
        this.message.set(`Vente n°${v.id} enregistrée.`);
        this.erreur.set('');
        this.panier.set([]);
        this.client = '';
        this.charger();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private charger(): void {
    this.api.ventes().subscribe((v) => this.ventes.set(v));
    if (this.auth.peutVendre()) {
      this.api.stocks().subscribe((s) => this.stocks.set(s));
    }
  }
}
