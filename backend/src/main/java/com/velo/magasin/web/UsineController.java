package com.velo.magasin.web;

import com.velo.magasin.dto.AssemblageDto;
import com.velo.magasin.dto.AssemblageRequest;
import com.velo.magasin.dto.CommandeDto;
import com.velo.magasin.dto.CommandeRequest;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.UsineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UsineController {

    private final UsineService usineService;

    public UsineController(UsineService usineService) {
        this.usineService = usineService;
    }

    @GetMapping("/commandes")
    public List<CommandeDto> commandes(@AuthenticationPrincipal CurrentUser user) {
        return usineService.listerCommandes(user);
    }

    @PostMapping("/commandes")
    @ResponseStatus(HttpStatus.CREATED)
    public CommandeDto commander(@AuthenticationPrincipal CurrentUser user, @Valid @RequestBody CommandeRequest req) {
        return usineService.passerCommande(user, req);
    }

    @PostMapping("/commandes/{id}/reception")
    public CommandeDto receptionner(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id) {
        return usineService.receptionner(user, id);
    }

    @PostMapping("/commandes/{id}/annulation")
    public CommandeDto annuler(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id) {
        return usineService.annuler(user, id);
    }

    @GetMapping("/assemblages")
    public List<AssemblageDto> assemblages(@AuthenticationPrincipal CurrentUser user) {
        return usineService.listerAssemblages(user);
    }

    @PostMapping("/assemblages")
    @ResponseStatus(HttpStatus.CREATED)
    public AssemblageDto assembler(@AuthenticationPrincipal CurrentUser user, @Valid @RequestBody AssemblageRequest req) {
        return usineService.assembler(user, req);
    }
}
