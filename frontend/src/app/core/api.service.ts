import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Assemblage,
  Commande,
  Fournisseur,
  Magasin,
  Produit,
  Role,
  Stock,
  TableauDeBord,
  Transfert,
  TypeProduit,
  Utilisateur,
  Vente,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  tableauDeBord() {
    return this.http.get<TableauDeBord>('/api/tableau-de-bord');
  }

  magasins() {
    return this.http.get<Magasin[]>('/api/magasins');
  }

  stocks(magasinId?: number | null) {
    const params = magasinId ? new HttpParams().set('magasinId', magasinId) : undefined;
    return this.http.get<Stock[]>('/api/stocks', { params });
  }

  modifierSeuil(stockId: number, valeur: number) {
    return this.http.put<Stock>(`/api/stocks/${stockId}/seuil`, null, { params: { valeur } });
  }

  produits(type?: TypeProduit) {
    const params = type ? new HttpParams().set('type', type) : undefined;
    return this.http.get<Produit[]>('/api/produits', { params });
  }

  creerProduit(p: unknown) {
    return this.http.post<Produit>('/api/produits', p);
  }

  modifierProduit(id: number, p: unknown) {
    return this.http.put<Produit>(`/api/produits/${id}`, p);
  }

  fournisseurs() {
    return this.http.get<Fournisseur[]>('/api/fournisseurs');
  }

  enregistrerFournisseur(f: Fournisseur) {
    return f.id
      ? this.http.put<Fournisseur>(`/api/fournisseurs/${f.id}`, f)
      : this.http.post<Fournisseur>('/api/fournisseurs', f);
  }

  commandes() {
    return this.http.get<Commande[]>('/api/commandes');
  }

  passerCommande(req: { fournisseurId: number; lignes: { pieceId: number; quantite: number; prixUnitaire: number }[] }) {
    return this.http.post<Commande>('/api/commandes', req);
  }

  receptionner(id: number) {
    return this.http.post<Commande>(`/api/commandes/${id}/reception`, null);
  }

  annulerCommande(id: number) {
    return this.http.post<Commande>(`/api/commandes/${id}/annulation`, null);
  }

  assemblages() {
    return this.http.get<Assemblage[]>('/api/assemblages');
  }

  assembler(veloId: number, quantite: number) {
    return this.http.post<Assemblage>('/api/assemblages', { veloId, quantite });
  }

  transferts() {
    return this.http.get<Transfert[]>('/api/transferts');
  }

  demanderTransfert(req: { destinationId: number | null; produitId: number; quantite: number; commentaire: string }) {
    return this.http.post<Transfert>('/api/transferts', req);
  }

  validerTransfert(id: number) {
    return this.http.post<Transfert>(`/api/transferts/${id}/validation`, null);
  }

  refuserTransfert(id: number) {
    return this.http.post<Transfert>(`/api/transferts/${id}/refus`, null);
  }

  ventes() {
    return this.http.get<Vente[]>('/api/ventes');
  }

  vendre(req: { client: string; lignes: { produitId: number; quantite: number }[] }) {
    return this.http.post<Vente>('/api/ventes', req);
  }

  utilisateurs() {
    return this.http.get<Utilisateur[]>('/api/utilisateurs');
  }

  creerUtilisateur(req: { username: string; password: string; nomComplet: string; role: Role; magasinId: number | null }) {
    return this.http.post<Utilisateur>('/api/utilisateurs', req);
  }

  activerUtilisateur(id: number, valeur: boolean) {
    return this.http.put<Utilisateur>(`/api/utilisateurs/${id}/actif`, null, { params: { valeur } });
  }
}
