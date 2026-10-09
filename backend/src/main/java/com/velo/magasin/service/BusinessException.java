package com.velo.magasin.service;

/** Règle métier non respectée (stock insuffisant, statut invalide...) : renvoyée en HTTP 400. */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
