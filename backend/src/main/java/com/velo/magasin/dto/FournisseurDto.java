package com.velo.magasin.dto;

import com.velo.magasin.model.Fournisseur;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record FournisseurDto(Long id, @NotBlank String nom, @Email String email, String telephone) {

    public static FournisseurDto from(Fournisseur f) {
        return new FournisseurDto(f.getId(), f.getNom(), f.getEmail(), f.getTelephone());
    }
}
