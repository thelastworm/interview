package com.velo.magasin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** destinationId est ignoré pour un responsable de boutique (sa propre boutique est utilisée). */
public record TransfertRequest(Long destinationId, @NotNull Long produitId, @Min(1) int quantite, String commentaire) {
}
