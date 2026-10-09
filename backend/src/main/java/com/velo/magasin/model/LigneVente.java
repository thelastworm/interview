package com.velo.magasin.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class LigneVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Vente vente;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Produit produit;

    private int quantite;

    /** Prix figé au moment de la vente. */
    @Column(precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    protected LigneVente() {
    }

    LigneVente(Vente vente, Produit produit, int quantite, BigDecimal prixUnitaire) {
        this.vente = vente;
        this.produit = produit;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
    }

    public Long getId() { return id; }
    public Produit getProduit() { return produit; }
    public int getQuantite() { return quantite; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
}
