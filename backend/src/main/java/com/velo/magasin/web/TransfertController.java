package com.velo.magasin.web;

import com.velo.magasin.dto.TransfertDto;
import com.velo.magasin.dto.TransfertRequest;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.TransfertService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transferts")
public class TransfertController {

    private final TransfertService transfertService;

    public TransfertController(TransfertService transfertService) {
        this.transfertService = transfertService;
    }

    @GetMapping
    public List<TransfertDto> lister(@AuthenticationPrincipal CurrentUser user) {
        return transfertService.lister(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransfertDto demander(@AuthenticationPrincipal CurrentUser user, @Valid @RequestBody TransfertRequest req) {
        return transfertService.demander(user, req);
    }

    @PostMapping("/{id}/validation")
    public TransfertDto valider(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id) {
        return transfertService.valider(user, id);
    }

    @PostMapping("/{id}/refus")
    public TransfertDto refuser(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id) {
        return transfertService.refuser(user, id);
    }
}
