package com.velo.magasin.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Réapprovisionnement d'une boutique depuis le stock central (usine).
 * Il ne s'agit pas d'une vente : aucun prix n'est associé, seul le stock est déplacé.
 */
@Entity
public class Transfert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Magasin destination;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Produit produit;

    private int quantite;

    @Enumerated(EnumType.STRING)
    private StatutTransfert statut = StatutTransfert.DEMANDE;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Utilisateur demandeur;

    @ManyToOne(fetch = FetchType.EAGER)
    private Utilisateur traitePar;

    private LocalDateTime dateDemande = LocalDateTime.now();

    private LocalDateTime dateTraitement;

    private String commentaire;

    protected Transfert() {
    }

    public Transfert(Magasin destination, Produit produit, int quantite, Utilisateur demandeur, String commentaire) {
        this.destination = destination;
        this.produit = produit;
        this.quantite = quantite;
        this.demandeur = demandeur;
        this.commentaire = commentaire;
    }

    public void traiter(StatutTransfert nouveauStatut, Utilisateur par) {
        this.statut = nouveauStatut;
        this.traitePar = par;
        this.dateTraitement = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Magasin getDestination() { return destination; }
    public Produit getProduit() { return produit; }
    public int getQuantite() { return quantite; }
    public StatutTransfert getStatut() { return statut; }
    public Utilisateur getDemandeur() { return demandeur; }
    public Utilisateur getTraitePar() { return traitePar; }
    public LocalDateTime getDateDemande() { return dateDemande; }
    public LocalDateTime getDateTraitement() { return dateTraitement; }
    public String getCommentaire() { return commentaire; }
}
