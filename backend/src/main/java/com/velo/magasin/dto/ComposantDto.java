package com.velo.magasin.dto;

import com.velo.magasin.model.Composant;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ComposantDto(@NotNull Long pieceId, String pieceNom, @Min(1) int quantite) {

    public static ComposantDto from(Composant c) {
        return new ComposantDto(c.getPiece().getId(), c.getPiece().getNom(), c.getQuantite());
    }
}
