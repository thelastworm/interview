package com.velo.magasin.dto;

import java.math.BigDecimal;

public record TableauDeBordDto(long nombreVentes, BigDecimal chiffreAffaires, long articlesEnStock,
                               long stocksBas, long transfertsEnAttente) {
}
