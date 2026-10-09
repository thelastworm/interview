package com.velo.magasin.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Commande de pièces détachées passée par l'usine à un fournisseur. */
@Entity
public class CommandeFournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Fournisseur fournisseur;

    @ManyToOne(optional = false)
    private Utilisateur creePar;

    private LocalDateTime dateCommande = LocalDateTime.now();

    private LocalDateTime dateReception;

    @Enumerated(EnumType.STRING)
    private StatutCommande statut = StatutCommande.EN_COURS;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<LigneCommande> lignes = new ArrayList<>();

    protected CommandeFournisseur() {
    }

    public CommandeFournisseur(Fournisseur fournisseur, Utilisateur creePar) {
        this.fournisseur = fournisseur;
        this.creePar = creePar;
    }

    public void ajouterLigne(Produit piece, int quantite, BigDecimal prixUnitaire) {
        lignes.add(new LigneCommande(this, piece, quantite, prixUnitaire));
    }

    public BigDecimal getTotal() {
        return lignes.stream()
                .map(l -> l.getPrixUnitaire().multiply(BigDecimal.valueOf(l.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void marquerRecue() {
        this.statut = StatutCommande.RECUE;
        this.dateReception = LocalDateTime.now();
    }

    public void annuler() {
        this.statut = StatutCommande.ANNULEE;
    }

    public Long getId() { return id; }
    public Fournisseur getFournisseur() { return fournisseur; }
    public Utilisateur getCreePar() { return creePar; }
    public LocalDateTime getDateCommande() { return dateCommande; }
    public LocalDateTime getDateReception() { return dateReception; }
    public StatutCommande getStatut() { return statut; }
    public List<LigneCommande> getLignes() { return lignes; }
}
