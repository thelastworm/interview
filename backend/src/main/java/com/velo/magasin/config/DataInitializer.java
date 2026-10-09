package com.velo.magasin.config;

import com.velo.magasin.model.*;
import com.velo.magasin.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Jeu de données de démonstration : 1 magasin central (usine) + 3 boutiques, des fournisseurs,
 * un catalogue de pièces et de vélos avec leur nomenclature, et un compte par profil.
 * Mot de passe de tous les comptes : {@value #MOT_DE_PASSE}.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    static final String MOT_DE_PASSE = "password";

    private final MagasinRepository magasins;
    private final UtilisateurRepository utilisateurs;
    private final FournisseurRepository fournisseurs;
    private final ProduitRepository produits;
    private final StockRepository stocks;
    private final PasswordEncoder encoder;

    public DataInitializer(MagasinRepository magasins, UtilisateurRepository utilisateurs,
                           FournisseurRepository fournisseurs, ProduitRepository produits,
                           StockRepository stocks, PasswordEncoder encoder) {
        this.magasins = magasins;
        this.utilisateurs = utilisateurs;
        this.fournisseurs = fournisseurs;
        this.produits = produits;
        this.stocks = stocks;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (magasins.count() > 0) {
            return;
        }

        // --- Magasins -------------------------------------------------------------------
        Magasin central = magasins.save(new Magasin("Magasin Central - Usine", "Lyon", TypeMagasin.CENTRAL));
        Magasin paris = magasins.save(new Magasin("Magasin Paris", "Paris", TypeMagasin.BOUTIQUE));
        Magasin marseille = magasins.save(new Magasin("Magasin Marseille", "Marseille", TypeMagasin.BOUTIQUE));
        Magasin bordeaux = magasins.save(new Magasin("Magasin Bordeaux", "Bordeaux", TypeMagasin.BOUTIQUE));

        // --- Utilisateurs (3 profils) ---------------------------------------------------
        String pwd = encoder.encode(MOT_DE_PASSE);
        utilisateurs.saveAll(List.of(
                new Utilisateur("admin", pwd, "Alice Directrice", Role.ADMIN, null),
                new Utilisateur("resp.central", pwd, "Claude Martin", Role.RESPONSABLE, central),
                new Utilisateur("vend.central", pwd, "Camille Petit", Role.VENDEUR, central),
                new Utilisateur("resp.paris", pwd, "Paul Durand", Role.RESPONSABLE, paris),
                new Utilisateur("vend.paris1", pwd, "Pauline Moreau", Role.VENDEUR, paris),
                new Utilisateur("vend.paris2", pwd, "Pierre Lefebvre", Role.VENDEUR, paris),
                new Utilisateur("resp.marseille", pwd, "Marc Roux", Role.RESPONSABLE, marseille),
                new Utilisateur("vend.marseille", pwd, "Marie Fournier", Role.VENDEUR, marseille),
                new Utilisateur("resp.bordeaux", pwd, "Bruno Girard", Role.RESPONSABLE, bordeaux),
                new Utilisateur("vend.bordeaux", pwd, "Béatrice Bonnet", Role.VENDEUR, bordeaux)));

        // --- Fournisseurs de pièces détachées -------------------------------------------
        Fournisseur cadrePro = fournisseurs.save(new Fournisseur("CadrePro", "contact@cadrepro.fr", "04 72 00 00 01"));
        Fournisseur roueExpress = fournisseurs.save(new Fournisseur("RoueExpress", "ventes@roueexpress.fr", "01 45 00 00 02"));
        Fournisseur shimaTech = fournisseurs.save(new Fournisseur("ShimaTech", "pro@shimatech.com", "03 20 00 00 03"));

        // --- Pièces détachées -----------------------------------------------------------
        Produit cadreVille = piece("P-CAD-VIL", "Cadre ville aluminium", "120.00", cadrePro);
        Produit cadreVtt = piece("P-CAD-VTT", "Cadre VTT carbone", "350.00", cadrePro);
        Produit roue28 = piece("P-ROU-28", "Roue 28 pouces", "45.00", roueExpress);
        Produit roue29 = piece("P-ROU-29", "Roue VTT 29 pouces", "70.00", roueExpress);
        Produit pneu = piece("P-PNE-01", "Pneu", "18.00", roueExpress);
        Produit freins = piece("P-FRE-01", "Kit freins à disque", "60.00", shimaTech);
        Produit transmission = piece("P-TRA-01", "Transmission 9 vitesses", "85.00", shimaTech);
        Produit selle = piece("P-SEL-01", "Selle confort", "25.00", cadrePro);
        Produit guidon = piece("P-GUI-01", "Guidon", "22.00", cadrePro);

        // --- Vélos et nomenclatures -----------------------------------------------------
        Produit veloVille = produits.save(new Produit("V-VILLE", "Vélo de ville", TypeProduit.VELO, new BigDecimal("549.00"), null)
                .ajouterComposant(cadreVille, 1).ajouterComposant(roue28, 2).ajouterComposant(pneu, 2)
                .ajouterComposant(freins, 1).ajouterComposant(transmission, 1)
                .ajouterComposant(selle, 1).ajouterComposant(guidon, 1));
        Produit vtt = produits.save(new Produit("V-VTT", "VTT carbone", TypeProduit.VELO, new BigDecimal("1290.00"), null)
                .ajouterComposant(cadreVtt, 1).ajouterComposant(roue29, 2).ajouterComposant(pneu, 2)
                .ajouterComposant(freins, 1).ajouterComposant(transmission, 1)
                .ajouterComposant(selle, 1).ajouterComposant(guidon, 1));

        // --- Stocks initiaux ------------------------------------------------------------
        for (Produit p : List.of(cadreVille, cadreVtt, guidon, selle, freins, transmission)) {
            stocks.save(new Stock(central, p, 20, 5));
        }
        stocks.save(new Stock(central, roue28, 40, 10));
        stocks.save(new Stock(central, roue29, 40, 10));
        stocks.save(new Stock(central, pneu, 80, 20));
        stocks.save(new Stock(central, veloVille, 10, 3));
        stocks.save(new Stock(central, vtt, 5, 2));

        for (Magasin m : List.of(paris, marseille, bordeaux)) {
            stocks.save(new Stock(m, veloVille, 4, 2));
            stocks.save(new Stock(m, vtt, 2, 1));
            stocks.save(new Stock(m, pneu, 10, 3));
            stocks.save(new Stock(m, selle, 5, 2));
        }
    }

    private Produit piece(String ref, String nom, String prix, Fournisseur f) {
        return produits.save(new Produit(ref, nom, TypeProduit.PIECE, new BigDecimal(prix), f));
    }
}
