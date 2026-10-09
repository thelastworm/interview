package com.velo.magasin.dto;

import com.velo.magasin.model.Produit;
import com.velo.magasin.model.TypeProduit;

import java.math.BigDecimal;
import java.util.List;

public record ProduitDto(Long id, String reference, String nom, TypeProduit type, BigDecimal prixVente,
                         Long fournisseurId, String fournisseurNom, List<ComposantDto> composants) {

    public static ProduitDto from(Produit p) {
        var f = p.getFournisseur();
        return new ProduitDto(p.getId(), p.getReference(), p.getNom(), p.getType(), p.getPrixVente(),
                f == null ? null : f.getId(), f == null ? null : f.getNom(),
                p.getComposants().stream().map(ComposantDto::from).toList());
    }
}
