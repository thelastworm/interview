package com.velo.magasin.model;

import jakarta.persistence.*;

@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nomComplet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Magasin de rattachement ; null pour un administrateur (direction). */
    @ManyToOne(fetch = FetchType.EAGER)
    private Magasin magasin;

    private boolean actif = true;

    protected Utilisateur() {
    }

    public Utilisateur(String username, String password, String nomComplet, Role role, Magasin magasin) {
        this.username = username;
        this.password = password;
        this.nomComplet = nomComplet;
        this.role = role;
        this.magasin = magasin;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getNomComplet() { return nomComplet; }
    public Role getRole() { return role; }
    public Magasin getMagasin() { return magasin; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
