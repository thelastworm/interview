package com.velo.magasin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CommandeRequest(@NotNull Long fournisseurId, @NotEmpty List<@Valid Ligne> lignes) {

    public record Ligne(@NotNull Long pieceId, @Min(1) int quantite, @NotNull @DecimalMin("0.0") BigDecimal prixUnitaire) {
    }
}
