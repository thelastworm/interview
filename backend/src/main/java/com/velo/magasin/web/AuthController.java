package com.velo.magasin.web;

import com.velo.magasin.dto.LoginRequest;
import com.velo.magasin.dto.LoginResponse;
import com.velo.magasin.dto.UtilisateurDto;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.UtilisateurService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UtilisateurService utilisateurService;

    public AuthController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return utilisateurService.login(req.username(), req.password());
    }

    @GetMapping("/me")
    public UtilisateurDto me(@AuthenticationPrincipal CurrentUser user) {
        return utilisateurService.moi(user);
    }
}
