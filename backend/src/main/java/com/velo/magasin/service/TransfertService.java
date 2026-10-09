package com.velo.magasin.service;

import com.velo.magasin.dto.TransfertDto;
import com.velo.magasin.dto.TransfertRequest;
import com.velo.magasin.model.*;
import com.velo.magasin.repository.TransfertRepository;
import com.velo.magasin.repository.UtilisateurRepository;
import com.velo.magasin.security.CurrentUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Réapprovisionnement des boutiques par le magasin central. Le central ne vend pas aux boutiques :
 * un transfert déplace simplement du stock, sans prix.
 */
@Service
@Transactional
public class TransfertService {

    private final TransfertRepository transferts;
    private final UtilisateurRepository utilisateurs;
    private final MagasinService magasinService;
    private final ProduitService produitService;
    private final StockService stockService;

    public TransfertService(TransfertRepository transferts, UtilisateurRepository utilisateurs,
                            MagasinService magasinService, ProduitService produitService, StockService stockService) {
        this.transferts = transferts;
        this.utilisateurs = utilisateurs;
        this.magasinService = magasinService;
        this.produitService = produitService;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public List<TransfertDto> lister(CurrentUser user) {
        var liste = user.peutGererUsine()
                ? transferts.findAllByOrderByDateDemandeDesc()
                : transferts.findByDestinationIdOrderByDateDemandeDesc(user.magasinId());
        return liste.stream().map(TransfertDto::from).toList();
    }

    public TransfertDto demander(CurrentUser user, TransfertRequest req) {
        Long destinationId;
        if (user.peutGererUsine()) {
            if (req.destinationId() == null) {
                throw new BusinessException("Le magasin de destination est obligatoire");
            }
            destinationId = req.destinationId();
        } else if (user.role() == Role.RESPONSABLE) {
            destinationId = user.magasinId();
        } else {
            throw new AccessDeniedException("Seul un responsable peut demander un réapprovisionnement");
        }
        Magasin destination = magasinService.get(destinationId);
        if (destination.isCentral()) {
            throw new BusinessException("Le magasin central ne peut pas être réapprovisionné par transfert");
        }
        Produit produit = produitService.get(req.produitId());
        var transfert = new Transfert(destination, produit, req.quantite(),
                utilisateurs.getReferenceById(user.id()), req.commentaire());
        return TransfertDto.from(transferts.save(transfert));
    }

    /** Validation par l'usine : le stock passe du central vers la boutique. */
    public TransfertDto valider(CurrentUser user, Long id) {
        Acces.exigerUsine(user);
        Transfert t = enAttente(id);
        stockService.retirer(magasinService.central(), t.getProduit(), t.getQuantite());
        stockService.ajouter(t.getDestination(), t.getProduit(), t.getQuantite());
        t.traiter(StatutTransfert.VALIDE, utilisateurs.getReferenceById(user.id()));
        return TransfertDto.from(t);
    }

    public TransfertDto refuser(CurrentUser user, Long id) {
        Acces.exigerUsine(user);
        Transfert t = enAttente(id);
        t.traiter(StatutTransfert.REFUSE, utilisateurs.getReferenceById(user.id()));
        return TransfertDto.from(t);
    }

    private Transfert enAttente(Long id) {
        Transfert t = transferts.findById(id).orElseThrow(() -> new NotFoundException("Transfert", id));
        if (t.getStatut() != StatutTransfert.DEMANDE) {
            throw new BusinessException("Ce transfert a déjà été traité");
        }
        return t;
    }
}
