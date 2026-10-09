package com.velo.magasin.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Article du catalogue : soit un vélo (fabriqué à l'usine), soit une pièce détachée (achetée à un fournisseur).
 */
@Entity
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeProduit type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixVente;

    /** Fournisseur habituel (pièces détachées uniquement). */
    @ManyToOne
    private Fournisseur fournisseur;

    /** Nomenclature : pièces nécessaires à l'assemblage d'un vélo. */
    @OneToMany(mappedBy = "velo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Composant> composants = new ArrayList<>();

    protected Produit() {
    }

    public Produit(String reference, String nom, TypeProduit type, BigDecimal prixVente, Fournisseur fournisseur) {
        this.reference = reference;
        this.nom = nom;
        this.type = type;
        this.prixVente = prixVente;
        this.fournisseur = fournisseur;
    }

    public Produit ajouterComposant(Produit piece, int quantite) {
        composants.add(new Composant(this, piece, quantite));
        return this;
    }

    public Long getId() { return id; }
    public String getReference() { return reference; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public TypeProduit getType() { return type; }
    public BigDecimal getPrixVente() { return prixVente; }
    public void setPrixVente(BigDecimal prixVente) { this.prixVente = prixVente; }
    public Fournisseur getFournisseur() { return fournisseur; }
    public void setFournisseur(Fournisseur fournisseur) { this.fournisseur = fournisseur; }
    public List<Composant> getComposants() { return composants; }
}
