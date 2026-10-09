package com.velo.magasin.model;

import jakarta.persistence.*;

/**
 * Un point de vente. Le magasin de type CENTRAL est aussi l'usine :
 * il reçoit les pièces des fournisseurs, assemble les vélos et réapprovisionne les boutiques.
 */
@Entity
public class Magasin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String ville;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMagasin type;

    protected Magasin() {
    }

    public Magasin(String nom, String ville, TypeMagasin type) {
        this.nom = nom;
        this.ville = ville;
        this.type = type;
    }

    public boolean isCentral() {
        return type == TypeMagasin.CENTRAL;
    }

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public String getVille() { return ville; }
    public TypeMagasin getType() { return type; }
}
