package com.velo.magasin.dto;

import com.velo.magasin.model.TypeProduit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProduitRequest(@NotBlank String reference,
                             @NotBlank String nom,
                             @NotNull TypeProduit type,
                             @NotNull @DecimalMin("0.0") BigDecimal prixVente,
                             Long fournisseurId,
                             List<@Valid ComposantDto> composants) {
}
