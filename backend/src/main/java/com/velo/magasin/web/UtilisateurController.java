package com.velo.magasin.web;

import com.velo.magasin.dto.UtilisateurDto;
import com.velo.magasin.dto.UtilisateurRequest;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.UtilisateurService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    public List<UtilisateurDto> lister(@AuthenticationPrincipal CurrentUser user) {
        return utilisateurService.lister(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurDto creer(@AuthenticationPrincipal CurrentUser user, @Valid @RequestBody UtilisateurRequest req) {
        return utilisateurService.creer(user, req);
    }

    @PutMapping("/{id}/actif")
    public UtilisateurDto activer(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id,
                                  @RequestParam boolean valeur) {
        return utilisateurService.changerActivation(user, id, valeur);
    }
}
