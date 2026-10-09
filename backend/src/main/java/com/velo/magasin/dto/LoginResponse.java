package com.velo.magasin.dto;

public record LoginResponse(String token, UtilisateurDto utilisateur) {
}
