package com.velo.magasin.dto;

import com.velo.magasin.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UtilisateurRequest(@NotBlank String username,
                                 @NotBlank @Size(min = 6) String password,
                                 @NotBlank String nomComplet,
                                 @NotNull Role role,
                                 Long magasinId) {
}
