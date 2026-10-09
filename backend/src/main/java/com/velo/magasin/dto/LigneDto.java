package com.velo.magasin.dto;

import java.math.BigDecimal;

/** Ligne de commande ou de vente en lecture. */
public record LigneDto(Long produitId, String produitNom, int quantite, BigDecimal prixUnitaire) {
}
