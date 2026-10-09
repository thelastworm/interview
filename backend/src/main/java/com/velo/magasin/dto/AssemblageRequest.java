package com.velo.magasin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AssemblageRequest(@NotNull Long veloId, @Min(1) int quantite) {
}
