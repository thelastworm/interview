import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { messageErreur } from '../core/auth.interceptor';
import { Magasin, Produit, Transfert } from '../core/models';

@Component({
  selector: 'app-transferts',
  imports: [FormsModule, DatePipe],
  template: `
    <h1>Réapprovisionnement depuis l'usine</h1>
    <p class="muet">
      Le magasin central ne vend pas aux autres magasins : un transfert déplace du stock de l'usine vers une boutique, sans facturation.
    </p>
    @if (erreur()) { <div class="erreur">{{ erreur() }}</div> }

    @if (!estCentral()) {
      <div class="carte">
        <h2>Nouvelle demande</h2>
        <div class="ligne-form">
          @if (auth.peutGererUsine()) {
            <label>
              Magasin destinataire
              <select [(ngModel)]="destinationId">
                @for (m of boutiques(); track m.id) { <option [ngValue]="m.id">{{ m.nom }}</option> }
              </select>
            </label>
          }
          <label>
            Produit
            <select [(ngModel)]="produitId">
              @for (p of produits(); track p.id) { <option [ngValue]="p.id">{{ p.nom }} ({{ p.reference }})</option> }
            </select>
          </label>
          <label>Quantité <input type="number" min="1" [(ngModel)]="quantite" style="width: 90px" /></label>
          <label>Commentaire <input [(ngModel)]="commentaire" /></label>
          <button (click)="demander()" [disabled]="!produitId || quantite < 1">Envoyer la demande</button>
        </div>
      </div>
    }

    <div class="carte">
      <h2>Demandes</h2>
      <table>
        <tr><th>Date</th><th>Destination</th><th>Produit</th><th class="num">Qté</th><th>Demandeur</th><th>Statut</th><th></th></tr>
        @for (t of transferts(); track t.id) {
          <tr>
            <td>{{ t.dateDemande | date: 'short' }}</td>
            <td>{{ t.destinationNom }}</td>
            <td>{{ t.produitNom }} @if (t.commentaire) { <div class="muet">{{ t.commentaire }}</div> }</td>
            <td class="num">{{ t.quantite }}</td>
            <td>{{ t.demandeur }}</td>
            <td>
              <span class="badge" [class.orange]="t.statut === 'DEMANDE'" [class.vert]="t.statut === 'VALIDE'" [class.rouge]="t.statut === 'REFUSE'">
                {{ libelles[t.statut] }}
              </span>
              @if (t.traitePar) { <div class="muet">par {{ t.traitePar }}</div> }
            </td>
            <td>
              @if (auth.peutGererUsine() && t.statut === 'DEMANDE') {
                <button class="succes petit" (click)="valider(t)">Expédier</button>
                <button class="danger petit" (click)="refuser(t)">Refuser</button>
              }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="muet">Aucune demande.</td></tr>
        }
      </table>
    </div>
  `,
  styles: `td button + button { margin-left: 4px; }`,
})
export class TransfertsPage {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly transferts = signal<Transfert[]>([]);
  readonly produits = signal<Produit[]>([]);
  readonly boutiques = signal<Magasin[]>([]);
  readonly erreur = signal('');
  readonly libelles = { DEMANDE: 'En attente', VALIDE: 'Expédié', REFUSE: 'Refusé' };

  /** Le responsable du central ne demande pas : il expédie. La direction peut faire les deux. */
  readonly estCentral = () => this.auth.user()?.role === 'RESPONSABLE' && this.auth.user()?.magasinCentral;

  destinationId: number | null = null;
  produitId: number | null = null;
  quantite = 1;
  commentaire = '';

  constructor() {
    this.api.produits().subscribe((p) => {
      this.produits.set(p);
      this.produitId = p[0]?.id ?? null;
    });
    if (this.auth.peutGererUsine()) {
      this.api.magasins().subscribe((m) => {
        const b = m.filter((x) => x.type === 'BOUTIQUE');
        this.boutiques.set(b);
        this.destinationId = b[0]?.id ?? null;
      });
    }
    this.charger();
  }

  demander(): void {
    const req = { destinationId: this.destinationId, produitId: this.produitId!, quantite: this.quantite, commentaire: this.commentaire };
    this.api.demanderTransfert(req).subscribe({
      next: () => {
        this.quantite = 1;
        this.commentaire = '';
        this.charger();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  valider(t: Transfert): void {
    this.api.validerTransfert(t.id).subscribe({ next: () => this.charger(), error: (e) => this.erreur.set(messageErreur(e)) });
  }

  refuser(t: Transfert): void {
    this.api.refuserTransfert(t.id).subscribe({ next: () => this.charger(), error: (e) => this.erreur.set(messageErreur(e)) });
  }

  private charger(): void {
    this.erreur.set('');
    this.api.transferts().subscribe((t) => this.transferts.set(t));
  }
}
