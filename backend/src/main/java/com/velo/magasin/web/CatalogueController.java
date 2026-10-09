package com.velo.magasin.web;

import com.velo.magasin.dto.FournisseurDto;
import com.velo.magasin.dto.ProduitDto;
import com.velo.magasin.dto.ProduitRequest;
import com.velo.magasin.model.TypeProduit;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.FournisseurService;
import com.velo.magasin.service.ProduitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogueController {

    private final ProduitService produitService;
    private final FournisseurService fournisseurService;

    public CatalogueController(ProduitService produitService, FournisseurService fournisseurService) {
        this.produitService = produitService;
        this.fournisseurService = fournisseurService;
    }

    @GetMapping("/produits")
    public List<ProduitDto> produits(@RequestParam(required = false) TypeProduit type) {
        return produitService.lister(type);
    }

    @PostMapping("/produits")
    @ResponseStatus(HttpStatus.CREATED)
    public ProduitDto creerProduit(@AuthenticationPrincipal CurrentUser user, @Valid @RequestBody ProduitRequest req) {
        return produitService.creer(user, req);
    }

    @PutMapping("/produits/{id}")
    public ProduitDto modifierProduit(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id,
                                      @Valid @RequestBody ProduitRequest req) {
        return produitService.modifier(user, id, req);
    }

    @GetMapping("/fournisseurs")
    public List<FournisseurDto> fournisseurs(@AuthenticationPrincipal CurrentUser user) {
        return fournisseurService.lister(user);
    }

    @PostMapping("/fournisseurs")
    @ResponseStatus(HttpStatus.CREATED)
    public FournisseurDto creerFournisseur(@AuthenticationPrincipal CurrentUser user,
                                           @Valid @RequestBody FournisseurDto dto) {
        return fournisseurService.creer(user, dto);
    }

    @PutMapping("/fournisseurs/{id}")
    public FournisseurDto modifierFournisseur(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id,
                                              @Valid @RequestBody FournisseurDto dto) {
        return fournisseurService.modifier(user, id, dto);
    }
}
