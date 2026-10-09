package com.velo.magasin.service;

import com.velo.magasin.security.CurrentUser;
import org.springframework.security.access.AccessDeniedException;

/** Règles d'autorisation métier partagées entre les services. */
final class Acces {

    private Acces() {
    }

    static void exigerUsine(CurrentUser user) {
        if (!user.peutGererUsine()) {
            throw new AccessDeniedException("Réservé à la direction et au responsable du magasin central (usine)");
        }
    }

    static void exigerAdmin(CurrentUser user) {
        if (!user.isAdmin()) {
            throw new AccessDeniedException("Réservé à la direction");
        }
    }

    /** L'administrateur et le responsable usine voient tous les magasins ; les autres uniquement le leur. */
    static void exigerLectureMagasin(CurrentUser user, Long magasinId) {
        if (!user.peutGererUsine() && !magasinId.equals(user.magasinId())) {
            throw new AccessDeniedException("Accès limité à votre magasin");
        }
    }
}
