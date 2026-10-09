package com.velo.magasin.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Vente à un client final, réalisée par un vendeur dans un magasin. */
@Entity
public class Vente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Magasin magasin;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Utilisateur vendeur;

    private String client;

    private LocalDateTime date = LocalDateTime.now();

    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<LigneVente> lignes = new ArrayList<>();

    protected Vente() {
    }

    public Vente(Magasin magasin, Utilisateur vendeur, String client) {
        this.magasin = magasin;
        this.vendeur = vendeur;
        this.client = client;
    }

    public void ajouterLigne(Produit produit, int quantite) {
        lignes.add(new LigneVente(this, produit, quantite, produit.getPrixVente()));
    }

    public BigDecimal getTotal() {
        return lignes.stream()
                .map(l -> l.getPrixUnitaire().multiply(BigDecimal.valueOf(l.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Long getId() { return id; }
    public Magasin getMagasin() { return magasin; }
    public Utilisateur getVendeur() { return vendeur; }
    public String getClient() { return client; }
    public LocalDateTime getDate() { return date; }
    public List<LigneVente> getLignes() { return lignes; }
}
