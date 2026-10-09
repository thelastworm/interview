package com.velo.magasin.service;

import com.velo.magasin.dto.AssemblageDto;
import com.velo.magasin.dto.AssemblageRequest;
import com.velo.magasin.dto.CommandeDto;
import com.velo.magasin.dto.CommandeRequest;
import com.velo.magasin.model.*;
import com.velo.magasin.repository.AssemblageRepository;
import com.velo.magasin.repository.CommandeFournisseurRepository;
import com.velo.magasin.repository.UtilisateurRepository;
import com.velo.magasin.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Activités propres au magasin central / usine : achats fournisseurs et assemblage des vélos. */
@Service
@Transactional
public class UsineService {

    private final CommandeFournisseurRepository commandes;
    private final AssemblageRepository assemblages;
    private final UtilisateurRepository utilisateurs;
    private final FournisseurService fournisseurService;
    private final ProduitService produitService;
    private final MagasinService magasinService;
    private final StockService stockService;

    public UsineService(CommandeFournisseurRepository commandes, AssemblageRepository assemblages,
                        UtilisateurRepository utilisateurs, FournisseurService fournisseurService,
                        ProduitService produitService, MagasinService magasinService, StockService stockService) {
        this.commandes = commandes;
        this.assemblages = assemblages;
        this.utilisateurs = utilisateurs;
        this.fournisseurService = fournisseurService;
        this.produitService = produitService;
        this.magasinService = magasinService;
        this.stockService = stockService;
    }

    // ---- Commandes fournisseurs ------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CommandeDto> listerCommandes(CurrentUser user) {
        Acces.exigerUsine(user);
        return commandes.findAllByOrderByDateCommandeDesc().stream().map(CommandeDto::from).toList();
    }

    public CommandeDto passerCommande(CurrentUser user, CommandeRequest req) {
        Acces.exigerUsine(user);
        Fournisseur fournisseur = fournisseurService.get(req.fournisseurId());
        var commande = new CommandeFournisseur(fournisseur, utilisateurs.getReferenceById(user.id()));
        for (CommandeRequest.Ligne l : req.lignes()) {
            Produit piece = produitService.get(l.pieceId());
            if (piece.getType() != TypeProduit.PIECE) {
                throw new BusinessException("Seules des pièces détachées peuvent être commandées aux fournisseurs");
            }
            commande.ajouterLigne(piece, l.quantite(), l.prixUnitaire());
        }
        return CommandeDto.from(commandes.save(commande));
    }

    /** Réception d'une commande : les pièces entrent dans le stock central. */
    public CommandeDto receptionner(CurrentUser user, Long commandeId) {
        Acces.exigerUsine(user);
        CommandeFournisseur commande = getCommande(commandeId);
        if (commande.getStatut() != StatutCommande.EN_COURS) {
            throw new BusinessException("La commande n'est plus en cours");
        }
        Magasin central = magasinService.central();
        commande.getLignes().forEach(l -> stockService.ajouter(central, l.getPiece(), l.getQuantite()));
        commande.marquerRecue();
        return CommandeDto.from(commande);
    }

    public CommandeDto annuler(CurrentUser user, Long commandeId) {
        Acces.exigerUsine(user);
        CommandeFournisseur commande = getCommande(commandeId);
        if (commande.getStatut() != StatutCommande.EN_COURS) {
            throw new BusinessException("La commande n'est plus en cours");
        }
        commande.annuler();
        return CommandeDto.from(commande);
    }

    private CommandeFournisseur getCommande(Long id) {
        return commandes.findById(id).orElseThrow(() -> new NotFoundException("Commande", id));
    }

    // ---- Assemblage ------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<AssemblageDto> listerAssemblages(CurrentUser user) {
        Acces.exigerUsine(user);
        return assemblages.findAllByOrderByDateDesc().stream().map(AssemblageDto::from).toList();
    }

    /** Assemble des vélos : consomme les pièces de la nomenclature dans le stock central et y ajoute les vélos. */
    public AssemblageDto assembler(CurrentUser user, AssemblageRequest req) {
        Acces.exigerUsine(user);
        Produit velo = produitService.get(req.veloId());
        if (velo.getType() != TypeProduit.VELO) {
            throw new BusinessException("Seul un vélo peut être assemblé");
        }
        if (velo.getComposants().isEmpty()) {
            throw new BusinessException("Aucune nomenclature définie pour " + velo.getNom());
        }
        Magasin central = magasinService.central();
        for (Composant c : velo.getComposants()) {
            stockService.retirer(central, c.getPiece(), c.getQuantite() * req.quantite());
        }
        stockService.ajouter(central, velo, req.quantite());
        var assemblage = new Assemblage(velo, req.quantite(), utilisateurs.getReferenceById(user.id()));
        return AssemblageDto.from(assemblages.save(assemblage));
    }
}
