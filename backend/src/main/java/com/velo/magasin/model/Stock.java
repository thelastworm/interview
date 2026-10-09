package com.velo.magasin.model;

import jakarta.persistence.*;

/** Quantité disponible d'un produit dans un magasin (un stock par magasin). */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"magasin_id", "produit_id"}))
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Magasin magasin;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Produit produit;

    private int quantite;

    /** En dessous de ce seuil, le stock est signalé comme bas. */
    private int seuilAlerte;

    @Version
    private long version;

    protected Stock() {
    }

    public Stock(Magasin magasin, Produit produit, int quantite, int seuilAlerte) {
        this.magasin = magasin;
        this.produit = produit;
        this.quantite = quantite;
        this.seuilAlerte = seuilAlerte;
    }

    public void ajouter(int qte) {
        this.quantite += qte;
    }

    public void retirer(int qte) {
        if (qte > quantite) {
            throw new IllegalStateException("Stock insuffisant");
        }
        this.quantite -= qte;
    }

    public Long getId() { return id; }
    public Magasin getMagasin() { return magasin; }
    public Produit getProduit() { return produit; }
    public int getQuantite() { return quantite; }
    public int getSeuilAlerte() { return seuilAlerte; }
    public void setSeuilAlerte(int seuilAlerte) { this.seuilAlerte = seuilAlerte; }
}
