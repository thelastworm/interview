import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { messageErreur } from '../core/auth.interceptor';
import { Assemblage, Commande, Fournisseur, Magasin, Produit, Stock } from '../core/models';

type Onglet = 'assemblage' | 'commandes' | 'fournisseurs';

interface LigneCommandeForm {
  pieceId: number | null;
  quantite: number;
  prixUnitaire: number;
}

@Component({
  selector: 'app-usine',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <h1>Usine — {{ central()?.nom }}</h1>
    <div class="onglets">
      <button [class.actif]="onglet() === 'assemblage'" (click)="onglet.set('assemblage')">Assemblage</button>
      <button [class.actif]="onglet() === 'commandes'" (click)="onglet.set('commandes')">Commandes fournisseurs</button>
      <button [class.actif]="onglet() === 'fournisseurs'" (click)="onglet.set('fournisseurs')">Fournisseurs</button>
    </div>
    @if (erreur()) { <div class="erreur">{{ erreur() }}</div> }
    @if (message()) { <div class="info">{{ message() }}</div> }

    @switch (onglet()) {
      @case ('assemblage') {
        <div class="carte">
          <h2>Assembler des vélos</h2>
          <div class="ligne-form">
            <label>
              Modèle
              <select [ngModel]="veloId()" (ngModelChange)="veloId.set($event)">
                @for (v of velos(); track v.id) { <option [ngValue]="v.id">{{ v.nom }}</option> }
              </select>
            </label>
            <label>Quantité <input type="number" min="1" [ngModel]="qteAssemblage()" (ngModelChange)="qteAssemblage.set($event)" style="width: 90px" /></label>
            <button (click)="assembler()" [disabled]="!assemblable()">Lancer l'assemblage</button>
          </div>
          @if (veloChoisi(); as v) {
            <table>
              <tr><th>Pièce</th><th class="num">Par vélo</th><th class="num">Nécessaire</th><th class="num">En stock (central)</th></tr>
              @for (c of v.composants; track c.pieceId) {
                <tr>
                  <td>{{ c.pieceNom }}</td>
                  <td class="num">{{ c.quantite }}</td>
                  <td class="num">{{ c.quantite * qteAssemblage() }}</td>
                  <td class="num">
                    <span class="badge" [class.vert]="dispo(c.pieceId) >= c.quantite * qteAssemblage()" [class.rouge]="dispo(c.pieceId) < c.quantite * qteAssemblage()">
                      {{ dispo(c.pieceId) }}
                    </span>
                  </td>
                </tr>
              }
            </table>
          }
        </div>
        <div class="carte">
          <h2>Historique d'assemblage</h2>
          <table>
            <tr><th>Date</th><th>Vélo</th><th class="num">Quantité</th><th>Réalisé par</th></tr>
            @for (a of assemblages(); track a.id) {
              <tr><td>{{ a.date | date: 'short' }}</td><td>{{ a.veloNom }}</td><td class="num">{{ a.quantite }}</td><td>{{ a.realisePar }}</td></tr>
            } @empty {
              <tr><td colspan="4" class="muet">Aucun assemblage.</td></tr>
            }
          </table>
        </div>
      }

      @case ('commandes') {
        <div class="carte">
          <h2>Nouvelle commande de pièces</h2>
          <div class="ligne-form">
            <label>
              Fournisseur
              <select [(ngModel)]="cmdFournisseurId" (ngModelChange)="cmdLignes = [nouvelleLigne()]">
                @for (f of fournisseurs(); track f.id) { <option [ngValue]="f.id">{{ f.nom }}</option> }
              </select>
            </label>
          </div>
          @for (l of cmdLignes; track $index; let i = $index) {
            <div class="ligne-form">
              <label>
                Pièce
                <select [(ngModel)]="l.pieceId" (ngModelChange)="l.prixUnitaire = prixAchatSuggere($event)">
                  @for (p of piecesDuFournisseur(); track p.id) { <option [ngValue]="p.id">{{ p.nom }}</option> }
                </select>
              </label>
              <label>Quantité <input type="number" min="1" [(ngModel)]="l.quantite" style="width: 90px" /></label>
              <label>Prix d'achat unitaire <input type="number" min="0" step="0.01" [(ngModel)]="l.prixUnitaire" style="width: 120px" /></label>
              <button class="danger petit" (click)="cmdLignes.splice(i, 1)" [disabled]="cmdLignes.length === 1">✕</button>
            </div>
          }
          <button class="secondaire" (click)="cmdLignes.push(nouvelleLigne())">+ Ligne</button>
          <button (click)="commander()" [disabled]="!commandeValide()" style="margin-left: 8px">Passer la commande</button>
        </div>
        <div class="carte">
          <h2>Commandes</h2>
          <table>
            <tr><th>N°</th><th>Date</th><th>Fournisseur</th><th>Pièces</th><th class="num">Total</th><th>Statut</th><th></th></tr>
            @for (c of commandes(); track c.id) {
              <tr>
                <td>{{ c.id }}</td>
                <td>{{ c.dateCommande | date: 'short' }}</td>
                <td>{{ c.fournisseurNom }}</td>
                <td>@for (l of c.lignes; track $index) { <div>{{ l.quantite }} × {{ l.produitNom }}</div> }</td>
                <td class="num">{{ c.total | currency: 'EUR' }}</td>
                <td>
                  <span class="badge" [class.orange]="c.statut === 'EN_COURS'" [class.vert]="c.statut === 'RECUE'" [class.rouge]="c.statut === 'ANNULEE'">
                    {{ c.statut === 'EN_COURS' ? 'En cours' : c.statut === 'RECUE' ? 'Reçue' : 'Annulée' }}
                  </span>
                </td>
                <td>
                  @if (c.statut === 'EN_COURS') {
                    <button class="succes petit" (click)="receptionner(c)">Réceptionner</button>
                    <button class="danger petit" (click)="annuler(c)" style="margin-left: 4px">Annuler</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="muet">Aucune commande.</td></tr>
            }
          </table>
        </div>
      }

      @case ('fournisseurs') {
        <div class="carte">
          <h2>{{ fournisseurForm.id ? 'Modifier' : 'Ajouter' }} un fournisseur</h2>
          <div class="ligne-form">
            <label>Nom <input [(ngModel)]="fournisseurForm.nom" /></label>
            <label>Email <input type="email" [(ngModel)]="fournisseurForm.email" /></label>
            <label>Téléphone <input [(ngModel)]="fournisseurForm.telephone" /></label>
            <button (click)="enregistrerFournisseur()" [disabled]="!fournisseurForm.nom">Enregistrer</button>
            @if (fournisseurForm.id) {
              <button class="secondaire" (click)="fournisseurForm = vide()">Annuler</button>
            }
          </div>
        </div>
        <div class="carte">
          <table>
            <tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Pièces fournies</th><th></th></tr>
            @for (f of fournisseurs(); track f.id) {
              <tr>
                <td>{{ f.nom }}</td>
                <td>{{ f.email }}</td>
                <td>{{ f.telephone }}</td>
                <td>{{ piecesDe(f.id!) }}</td>
                <td><button class="secondaire petit" (click)="editerFournisseur(f)">Modifier</button></td>
              </tr>
            }
          </table>
        </div>
      }
    }
  `,
})
export class UsinePage {
  private readonly api = inject(ApiService);

  readonly onglet = signal<Onglet>('assemblage');
  readonly erreur = signal('');
  readonly message = signal('');
  readonly central = signal<Magasin | null>(null);
  readonly produits = signal<Produit[]>([]);
  readonly stockCentral = signal<Stock[]>([]);
  readonly assemblages = signal<Assemblage[]>([]);
  readonly commandes = signal<Commande[]>([]);
  readonly fournisseurs = signal<Fournisseur[]>([]);

  readonly velos = computed(() => this.produits().filter((p) => p.type === 'VELO'));
  readonly veloId = signal<number | null>(null);
  readonly qteAssemblage = signal(1);
  readonly veloChoisi = computed(() => this.velos().find((v) => v.id === this.veloId()) ?? null);
  readonly assemblable = computed(() => {
    const v = this.veloChoisi();
    return !!v && this.qteAssemblage() >= 1 && v.composants.every((c) => this.dispo(c.pieceId) >= c.quantite * this.qteAssemblage());
  });

  cmdFournisseurId: number | null = null;
  cmdLignes: LigneCommandeForm[] = [];
  fournisseurForm: Fournisseur = this.vide();

  constructor() {
    this.api.magasins().subscribe((m) => {
      const c = m.find((x) => x.type === 'CENTRAL') ?? null;
      this.central.set(c);
      this.chargerStock();
    });
    forkJoin([this.api.produits(), this.api.fournisseurs()]).subscribe(([p, f]) => {
      this.produits.set(p);
      this.veloId.set(this.velos()[0]?.id ?? null);
      this.fournisseurs.set(f);
      this.cmdFournisseurId = f[0]?.id ?? null;
      this.cmdLignes = [this.nouvelleLigne()];
    });
    this.chargerAssemblages();
    this.chargerCommandes();
  }

  dispo(produitId: number): number {
    return this.stockCentral().find((s) => s.produitId === produitId)?.quantite ?? 0;
  }

  piecesDuFournisseur(): Produit[] {
    return this.produits().filter((p) => p.type === 'PIECE' && p.fournisseurId === this.cmdFournisseurId);
  }

  piecesDe(fournisseurId: number): string {
    return this.produits().filter((p) => p.fournisseurId === fournisseurId).map((p) => p.nom).join(', ') || '—';
  }

  /** Prix d'achat proposé par défaut : 60 % du prix de vente. */
  prixAchatSuggere(pieceId: number | null): number {
    const p = this.produits().find((x) => x.id === pieceId);
    return p ? Math.round(p.prixVente * 60) / 100 : 0;
  }

  nouvelleLigne(): LigneCommandeForm {
    const premiere = this.piecesDuFournisseur()[0];
    return { pieceId: premiere?.id ?? null, quantite: 10, prixUnitaire: this.prixAchatSuggere(premiere?.id ?? null) };
  }

  commandeValide(): boolean {
    return !!this.cmdFournisseurId && this.cmdLignes.every((l) => l.pieceId && l.quantite >= 1 && l.prixUnitaire >= 0);
  }

  vide(): Fournisseur {
    return { nom: '', email: '', telephone: '' };
  }

  assembler(): void {
    this.reset();
    this.api.assembler(this.veloId()!, this.qteAssemblage()).subscribe({
      next: (a) => {
        this.message.set(`${a.quantite} × ${a.veloNom} assemblé(s) et ajouté(s) au stock central.`);
        this.chargerAssemblages();
        this.chargerStock();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  commander(): void {
    this.reset();
    const lignes = this.cmdLignes.filter((l) => l.pieceId).map((l) => ({ ...l, pieceId: l.pieceId! }));
    this.api.passerCommande({ fournisseurId: this.cmdFournisseurId!, lignes }).subscribe({
      next: (c) => {
        this.message.set(`Commande n°${c.id} envoyée à ${c.fournisseurNom}.`);
        this.cmdLignes = [this.nouvelleLigne()];
        this.chargerCommandes();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  receptionner(c: Commande): void {
    this.reset();
    this.api.receptionner(c.id).subscribe({
      next: () => {
        this.message.set(`Commande n°${c.id} réceptionnée : pièces ajoutées au stock central.`);
        this.chargerCommandes();
        this.chargerStock();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  annuler(c: Commande): void {
    this.reset();
    this.api.annulerCommande(c.id).subscribe({ next: () => this.chargerCommandes(), error: (e) => this.erreur.set(messageErreur(e)) });
  }

  editerFournisseur(f: Fournisseur): void {
    this.fournisseurForm = { ...f };
  }

  enregistrerFournisseur(): void {
    this.reset();
    this.api.enregistrerFournisseur(this.fournisseurForm).subscribe({
      next: () => {
        this.fournisseurForm = this.vide();
        this.api.fournisseurs().subscribe((f) => this.fournisseurs.set(f));
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private reset(): void {
    this.erreur.set('');
    this.message.set('');
  }

  private chargerStock(): void {
    const c = this.central();
    if (c) {
      this.api.stocks(c.id).subscribe((s) => this.stockCentral.set(s));
    }
  }

  private chargerAssemblages(): void {
    this.api.assemblages().subscribe((a) => this.assemblages.set(a));
  }

  private chargerCommandes(): void {
    this.api.commandes().subscribe((c) => this.commandes.set(c));
  }
}
