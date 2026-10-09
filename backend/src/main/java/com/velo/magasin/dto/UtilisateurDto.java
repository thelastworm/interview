package com.velo.magasin.dto;

import com.velo.magasin.model.Role;
import com.velo.magasin.model.Utilisateur;

public record UtilisateurDto(Long id, String username, String nomComplet, Role role,
                             Long magasinId, String magasinNom, boolean magasinCentral, boolean actif) {

    public static UtilisateurDto from(Utilisateur u) {
        var m = u.getMagasin();
        return new UtilisateurDto(u.getId(), u.getUsername(), u.getNomComplet(), u.getRole(),
                m == null ? null : m.getId(), m == null ? null : m.getNom(), m != null && m.isCentral(), u.isActif());
    }
}
