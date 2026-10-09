package com.velo.magasin.web;

import com.velo.magasin.dto.VenteDto;
import com.velo.magasin.dto.VenteRequest;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.VenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventes")
public class VenteController {

    private final VenteService venteService;

    public VenteController(VenteService venteService) {
        this.venteService = venteService;
    }

    @GetMapping
    public List<VenteDto> lister(@AuthenticationPrincipal CurrentUser user) {
        return venteService.lister(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VenteDto vendre(@AuthenticationPrincipal CurrentUser user, @Valid @RequestBody VenteRequest req) {
        return venteService.vendre(user, req);
    }
}
