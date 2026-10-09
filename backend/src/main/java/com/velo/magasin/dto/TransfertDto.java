package com.velo.magasin.dto;

import com.velo.magasin.model.StatutTransfert;
import com.velo.magasin.model.Transfert;

import java.time.LocalDateTime;

public record TransfertDto(Long id, Long destinationId, String destinationNom, Long produitId, String produitNom,
                           int quantite, StatutTransfert statut, String demandeur, String traitePar,
                           LocalDateTime dateDemande, LocalDateTime dateTraitement, String commentaire) {

    public static TransfertDto from(Transfert t) {
        return new TransfertDto(t.getId(), t.getDestination().getId(), t.getDestination().getNom(),
                t.getProduit().getId(), t.getProduit().getNom(), t.getQuantite(), t.getStatut(),
                t.getDemandeur().getNomComplet(), t.getTraitePar() == null ? null : t.getTraitePar().getNomComplet(),
                t.getDateDemande(), t.getDateTraitement(), t.getCommentaire());
    }
}
