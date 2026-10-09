package com.velo.magasin.model;

import jakarta.persistence.*;

/** Ligne de nomenclature : un vélo nécessite {@code quantite} exemplaires d'une pièce. */
@Entity
public class Composant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Produit velo;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Produit piece;

    private int quantite;

    protected Composant() {
    }

    Composant(Produit velo, Produit piece, int quantite) {
        this.velo = velo;
        this.piece = piece;
        this.quantite = quantite;
    }

    public Long getId() { return id; }
    public Produit getVelo() { return velo; }
    public Produit getPiece() { return piece; }
    public int getQuantite() { return quantite; }
}
