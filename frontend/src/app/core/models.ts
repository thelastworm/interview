export type Role = 'ADMIN' | 'RESPONSABLE' | 'VENDEUR';
export type TypeProduit = 'VELO' | 'PIECE';
export type TypeMagasin = 'CENTRAL' | 'BOUTIQUE';

export interface Utilisateur {
  id: number;
  username: string;
  nomComplet: string;
  role: Role;
  magasinId: number | null;
  magasinNom: string | null;
  magasinCentral: boolean;
  actif: boolean;
}

export interface LoginResponse {
  token: string;
  utilisateur: Utilisateur;
}

export interface Magasin {
  id: number;
  nom: string;
  ville: string;
  type: TypeMagasin;
}

export interface Fournisseur {
  id?: number;
  nom: string;
  email: string;
  telephone: string;
}

export interface Composant {
  pieceId: number;
  pieceNom?: string;
  quantite: number;
}

export interface Produit {
  id: number;
  reference: string;
  nom: string;
  type: TypeProduit;
  prixVente: number;
  fournisseurId: number | null;
  fournisseurNom: string | null;
  composants: Composant[];
}

export interface Stock {
  id: number;
  magasinId: number;
  magasinNom: string;
  produitId: number;
  produitReference: string;
  produitNom: string;
  produitType: TypeProduit;
  prixVente: number;
  quantite: number;
  seuilAlerte: number;
  stockBas: boolean;
}

export interface Ligne {
  produitId: number;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Commande {
  id: number;
  fournisseurId: number;
  fournisseurNom: string;
  statut: 'EN_COURS' | 'RECUE' | 'ANNULEE';
  dateCommande: string;
  dateReception: string | null;
  creePar: string;
  lignes: Ligne[];
  total: number;
}

export interface Assemblage {
  id: number;
  veloId: number;
  veloNom: string;
  quantite: number;
  realisePar: string;
  date: string;
}

export interface Transfert {
  id: number;
  destinationId: number;
  destinationNom: string;
  produitId: number;
  produitNom: string;
  quantite: number;
  statut: 'DEMANDE' | 'VALIDE' | 'REFUSE';
  demandeur: string;
  traitePar: string | null;
  dateDemande: string;
  dateTraitement: string | null;
  commentaire: string | null;
}

export interface Vente {
  id: number;
  magasinId: number;
  magasinNom: string;
  vendeur: string;
  client: string | null;
  date: string;
  lignes: Ligne[];
  total: number;
}

export interface TableauDeBord {
  nombreVentes: number;
  chiffreAffaires: number;
  articlesEnStock: number;
  stocksBas: number;
  transfertsEnAttente: number;
}

export const ROLE_LIBELLE: Record<Role, string> = {
  ADMIN: 'Direction',
  RESPONSABLE: 'Responsable',
  VENDEUR: 'Vendeur',
};
