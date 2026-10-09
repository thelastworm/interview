package com.velo.magasin.dto;

import com.velo.magasin.model.Magasin;
import com.velo.magasin.model.TypeMagasin;

public record MagasinDto(Long id, String nom, String ville, TypeMagasin type) {

    public static MagasinDto from(Magasin m) {
        return new MagasinDto(m.getId(), m.getNom(), m.getVille(), m.getType());
    }
}
