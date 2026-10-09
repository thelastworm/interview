package com.velo.magasin.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Ordre d'assemblage réalisé à l'usine : consomme des pièces et produit des vélos. */
@Entity
public class Assemblage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Produit velo;

    private int quantite;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Utilisateur realisePar;

    private LocalDateTime date = LocalDateTime.now();

    protected Assemblage() {
    }

    public Assemblage(Produit velo, int quantite, Utilisateur realisePar) {
        this.velo = velo;
        this.quantite = quantite;
        this.realisePar = realisePar;
    }

    public Long getId() { return id; }
    public Produit getVelo() { return velo; }
    public int getQuantite() { return quantite; }
    public Utilisateur getRealisePar() { return realisePar; }
    public LocalDateTime getDate() { return date; }
}
