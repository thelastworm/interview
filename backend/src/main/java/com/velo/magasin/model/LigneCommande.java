package com.velo.magasin.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private CommandeFournisseur commande;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Produit piece;

    private int quantite;

    @Column(precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    protected LigneCommande() {
    }

    LigneCommande(CommandeFournisseur commande, Produit piece, int quantite, BigDecimal prixUnitaire) {
        this.commande = commande;
        this.piece = piece;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
    }

    public Long getId() { return id; }
    public Produit getPiece() { return piece; }
    public int getQuantite() { return quantite; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
}
