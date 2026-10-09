package com.velo.magasin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record VenteRequest(String client, @NotEmpty List<@Valid Ligne> lignes) {

    public record Ligne(@NotNull Long produitId, @Min(1) int quantite) {
    }
}
