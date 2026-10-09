package com.velo.magasin.security;

import com.velo.magasin.model.Role;
import com.velo.magasin.model.Utilisateur;

/** Utilisateur authentifié, placé dans le SecurityContext par {@link JwtAuthFilter}. */
public record CurrentUser(Long id, String username, Role role, Long magasinId, boolean magasinCentral) {

    public static CurrentUser of(Utilisateur u) {
        var m = u.getMagasin();
        return new CurrentUser(u.getId(), u.getUsername(), u.getRole(),
                m == null ? null : m.getId(), m != null && m.isCentral());
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    /** Peut piloter l'usine : fournisseurs, commandes, assemblage, validation des transferts. */
    public boolean peutGererUsine() {
        return isAdmin() || (role == Role.RESPONSABLE && magasinCentral);
    }
}
