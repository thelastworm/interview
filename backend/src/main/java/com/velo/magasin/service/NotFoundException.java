package com.velo.magasin.service;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String entite, Long id) {
        super(entite + " introuvable : " + id);
    }
}
