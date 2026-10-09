package com.velo.magasin.dto;

import com.velo.magasin.model.CommandeFournisseur;
import com.velo.magasin.model.StatutCommande;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CommandeDto(Long id, Long fournisseurId, String fournisseurNom, StatutCommande statut,
                          LocalDateTime dateCommande, LocalDateTime dateReception, String creePar,
                          List<LigneDto> lignes, BigDecimal total) {

    public static CommandeDto from(CommandeFournisseur c) {
        return new CommandeDto(c.getId(), c.getFournisseur().getId(), c.getFournisseur().getNom(), c.getStatut(),
                c.getDateCommande(), c.getDateReception(), c.getCreePar().getNomComplet(),
                c.getLignes().stream()
                        .map(l -> new LigneDto(l.getPiece().getId(), l.getPiece().getNom(), l.getQuantite(), l.getPrixUnitaire()))
                        .toList(),
                c.getTotal());
    }
}
