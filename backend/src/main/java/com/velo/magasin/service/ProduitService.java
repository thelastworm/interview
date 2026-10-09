package com.velo.magasin.service;

import com.velo.magasin.dto.ComposantDto;
import com.velo.magasin.dto.ProduitDto;
import com.velo.magasin.dto.ProduitRequest;
import com.velo.magasin.model.Fournisseur;
import com.velo.magasin.model.Produit;
import com.velo.magasin.model.TypeProduit;
import com.velo.magasin.repository.FournisseurRepository;
import com.velo.magasin.repository.ProduitRepository;
import com.velo.magasin.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProduitService {

    private final ProduitRepository produits;
    private final FournisseurRepository fournisseurs;

    public ProduitService(ProduitRepository produits, FournisseurRepository fournisseurs) {
        this.produits = produits;
        this.fournisseurs = fournisseurs;
    }

    @Transactional(readOnly = true)
    public List<ProduitDto> lister(TypeProduit type) {
        var liste = type == null ? produits.findAll() : produits.findByTypeOrderByNom(type);
        return liste.stream().map(ProduitDto::from).toList();
    }

    public ProduitDto creer(CurrentUser user, ProduitRequest req) {
        Acces.exigerUsine(user);
        if (produits.existsByReference(req.reference())) {
            throw new BusinessException("La référence " + req.reference() + " existe déjà");
        }
        var produit = new Produit(req.reference(), req.nom(), req.type(), req.prixVente(), fournisseur(req));
        appliquerNomenclature(produit, req.composants());
        return ProduitDto.from(produits.save(produit));
    }

    public ProduitDto modifier(CurrentUser user, Long id, ProduitRequest req) {
        Acces.exigerUsine(user);
        Produit produit = get(id);
        produit.setNom(req.nom());
        produit.setPrixVente(req.prixVente());
        produit.setFournisseur(fournisseur(req));
        produit.getComposants().clear();
        appliquerNomenclature(produit, req.composants());
        return ProduitDto.from(produit);
    }

    Produit get(Long id) {
        return produits.findById(id).orElseThrow(() -> new NotFoundException("Produit", id));
    }

    private Fournisseur fournisseur(ProduitRequest req) {
        if (req.type() == TypeProduit.VELO || req.fournisseurId() == null) {
            return null;
        }
        return fournisseurs.findById(req.fournisseurId())
                .orElseThrow(() -> new NotFoundException("Fournisseur", req.fournisseurId()));
    }

    private void appliquerNomenclature(Produit produit, List<ComposantDto> composants) {
        if (produit.getType() != TypeProduit.VELO || composants == null) {
            return;
        }
        for (ComposantDto c : composants) {
            Produit piece = get(c.pieceId());
            if (piece.getType() != TypeProduit.PIECE) {
                throw new BusinessException("Un vélo ne peut être composé que de pièces détachées");
            }
            produit.ajouterComposant(piece, c.quantite());
        }
    }
}
