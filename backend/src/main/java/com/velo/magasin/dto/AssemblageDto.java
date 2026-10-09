package com.velo.magasin.dto;

import com.velo.magasin.model.Assemblage;

import java.time.LocalDateTime;

public record AssemblageDto(Long id, Long veloId, String veloNom, int quantite, String realisePar, LocalDateTime date) {

    public static AssemblageDto from(Assemblage a) {
        return new AssemblageDto(a.getId(), a.getVelo().getId(), a.getVelo().getNom(), a.getQuantite(),
                a.getRealisePar().getNomComplet(), a.getDate());
    }
}
