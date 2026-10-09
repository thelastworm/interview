package com.velo.magasin.dto;

import com.velo.magasin.model.Vente;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VenteDto(Long id, Long magasinId, String magasinNom, String vendeur, String client,
                       LocalDateTime date, List<LigneDto> lignes, BigDecimal total) {

    public static VenteDto from(Vente v) {
        return new VenteDto(v.getId(), v.getMagasin().getId(), v.getMagasin().getNom(), v.getVendeur().getNomComplet(),
                v.getClient(), v.getDate(),
                v.getLignes().stream()
                        .map(l -> new LigneDto(l.getProduit().getId(), l.getProduit().getNom(), l.getQuantite(), l.getPrixUnitaire()))
                        .toList(),
                v.getTotal());
    }
}
