import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { messageErreur } from '../core/auth.interceptor';
import { Composant, Fournisseur, Produit, TypeProduit } from '../core/models';

interface ProduitForm {
  id: number | null;
  reference: string;
  nom: string;
  type: TypeProduit;
  prixVente: number;
  fournisseurId: number | null;
  composants: Composant[];
}

@Component({
  selector: 'app-catalogue',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <h1>Catalogue</h1>
    @if (erreur()) { <div class="erreur">{{ erreur() }}</div> }

    @if (auth.peutGererUsine() && form) {
      <div class="carte">
        <h2>{{ form.id ? 'Modifier ' + form.reference : 'Nouveau produit' }}</h2>
        <div class="ligne-form">
          <label>Référence <input [(ngModel)]="form.reference" [disabled]="!!form.id" /></label>
          <label>Nom <input [(ngModel)]="form.nom" /></label>
          <label>
            Type
            <select [(ngModel)]="form.type" [disabled]="!!form.id">
              <option value="VELO">Vélo</option>
              <option value="PIECE">Pièce détachée</option>
            </select>
          </label>
          <label>Prix de vente <input type="number" min="0" step="0.01" [(ngModel)]="form.prixVente" style="width: 110px" /></label>
          @if (form.type === 'PIECE') {
            <label>
              Fournisseur
              <select [(ngModel)]="form.fournisseurId">
                @for (f of fournisseurs(); track f.id) { <option [ngValue]="f.id">{{ f.nom }}</option> }
              </select>
            </label>
          }
        </div>
        @if (form.type === 'VELO') {
          <h3>Nomenclature</h3>
          @for (c of form.composants; track $index; let i = $index) {
            <div class="ligne-form">
              <select [(ngModel)]="c.pieceId">
                @for (p of pieces(); track p.id) { <option [ngValue]="p.id">{{ p.nom }}</option> }
              </select>
              <input type="number" min="1" [(ngModel)]="c.quantite" style="width: 80px" />
              <button class="danger petit" (click)="form.composants.splice(i, 1)">✕</button>
            </div>
          }
          <button class="secondaire petit" (click)="form.composants.push({ pieceId: pieces()[0].id, quantite: 1 })">+ Pièce</button>
        }
        <div style="margin-top: 12px">
          <button (click)="enregistrer()" [disabled]="!form.reference || !form.nom">Enregistrer</button>
          <button class="secondaire" (click)="form = nouveau()" style="margin-left: 8px">Réinitialiser</button>
        </div>
      </div>
    }

    <div class="carte">
      <h2>Vélos</h2>
      <table>
        <tr><th>Référence</th><th>Nom</th><th class="num">Prix</th><th>Nomenclature</th><th></th></tr>
        @for (p of velos(); track p.id) {
          <tr>
            <td>{{ p.reference }}</td>
            <td>{{ p.nom }}</td>
            <td class="num">{{ p.prixVente | currency: 'EUR' }}</td>
            <td>@for (c of p.composants; track c.pieceId) { <div>{{ c.quantite }} × {{ c.pieceNom }}</div> }</td>
            <td>@if (auth.peutGererUsine()) { <button class="secondaire petit" (click)="editer(p)">Modifier</button> }</td>
          </tr>
        }
      </table>
    </div>
    <div class="carte">
      <h2>Pièces détachées</h2>
      <table>
        <tr><th>Référence</th><th>Nom</th><th class="num">Prix</th><th>Fournisseur</th><th></th></tr>
        @for (p of pieces(); track p.id) {
          <tr>
            <td>{{ p.reference }}</td>
            <td>{{ p.nom }}</td>
            <td class="num">{{ p.prixVente | currency: 'EUR' }}</td>
            <td>{{ p.fournisseurNom ?? '—' }}</td>
            <td>@if (auth.peutGererUsine()) { <button class="secondaire petit" (click)="editer(p)">Modifier</button> }</td>
          </tr>
        }
      </table>
    </div>
  `,
  styles: `h3 { font-size: 15px; margin: 8px 0; }`,
})
export class CataloguePage {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly produits = signal<Produit[]>([]);
  readonly fournisseurs = signal<Fournisseur[]>([]);
  readonly erreur = signal('');
  readonly velos = computed(() => this.produits().filter((p) => p.type === 'VELO'));
  readonly pieces = computed(() => this.produits().filter((p) => p.type === 'PIECE'));

  form: ProduitForm | null = null;

  constructor() {
    this.charger();
    if (this.auth.peutGererUsine()) {
      this.form = this.nouveau();
      this.api.fournisseurs().subscribe((f) => this.fournisseurs.set(f));
    }
  }

  nouveau(): ProduitForm {
    return { id: null, reference: '', nom: '', type: 'PIECE', prixVente: 0, fournisseurId: null, composants: [] };
  }

  editer(p: Produit): void {
    this.form = { ...p, composants: p.composants.map((c) => ({ ...c })) };
    window.scrollTo({ top: 0 });
  }

  enregistrer(): void {
    const f = this.form!;
    const req = { ...f, composants: f.type === 'VELO' ? f.composants : [] };
    const appel = f.id ? this.api.modifierProduit(f.id, req) : this.api.creerProduit(req);
    appel.subscribe({
      next: () => {
        this.erreur.set('');
        this.form = this.nouveau();
        this.charger();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private charger(): void {
    this.api.produits().subscribe((p) => this.produits.set(p));
  }
}
