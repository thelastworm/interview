package com.velo.magasin.dto;

import com.velo.magasin.model.Stock;
import com.velo.magasin.model.TypeProduit;

import java.math.BigDecimal;

public record StockDto(Long id, Long magasinId, String magasinNom, Long produitId, String produitReference,
                       String produitNom, TypeProduit produitType, BigDecimal prixVente,
                       int quantite, int seuilAlerte, boolean stockBas) {

    public static StockDto from(Stock s) {
        var p = s.getProduit();
        return new StockDto(s.getId(), s.getMagasin().getId(), s.getMagasin().getNom(), p.getId(), p.getReference(),
                p.getNom(), p.getType(), p.getPrixVente(), s.getQuantite(), s.getSeuilAlerte(),
                s.getQuantite() <= s.getSeuilAlerte());
    }
}
