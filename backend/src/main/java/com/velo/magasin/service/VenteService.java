package com.velo.magasin.service;

import com.velo.magasin.dto.VenteDto;
import com.velo.magasin.dto.VenteRequest;
import com.velo.magasin.model.Magasin;
import com.velo.magasin.model.Produit;
import com.velo.magasin.model.Role;
import com.velo.magasin.model.Vente;
import com.velo.magasin.repository.UtilisateurRepository;
import com.velo.magasin.repository.VenteRepository;
import com.velo.magasin.security.CurrentUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Ventes aux clients finaux, réalisées dans le magasin de l'utilisateur à partir de son stock. */
@Service
@Transactional
public class VenteService {

    private final VenteRepository ventes;
    private final UtilisateurRepository utilisateurs;
    private final MagasinService magasinService;
    private final ProduitService produitService;
    private final StockService stockService;

    public VenteService(VenteRepository ventes, UtilisateurRepository utilisateurs, MagasinService magasinService,
                        ProduitService produitService, StockService stockService) {
        this.ventes = ventes;
        this.utilisateurs = utilisateurs;
        this.magasinService = magasinService;
        this.produitService = produitService;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public List<VenteDto> lister(CurrentUser user) {
        List<Vente> liste = switch (user.role()) {
            case ADMIN -> ventes.findAllByOrderByDateDesc();
            case RESPONSABLE -> ventes.findByMagasinIdOrderByDateDesc(user.magasinId());
            case VENDEUR -> ventes.findByVendeurIdOrderByDateDesc(user.id());
        };
        return liste.stream().map(VenteDto::from).toList();
    }

    public VenteDto vendre(CurrentUser user, VenteRequest req) {
        if (user.role() == Role.ADMIN || user.magasinId() == null) {
            throw new AccessDeniedException("Une vente est réalisée par un vendeur ou un responsable de magasin");
        }
        Magasin magasin = magasinService.get(user.magasinId());
        var vente = new Vente(magasin, utilisateurs.getReferenceById(user.id()), req.client());
        for (VenteRequest.Ligne l : req.lignes()) {
            Produit produit = produitService.get(l.produitId());
            stockService.retirer(magasin, produit, l.quantite());
            vente.ajouterLigne(produit, l.quantite());
        }
        return VenteDto.from(ventes.save(vente));
    }
}
