package com.velo.magasin.service;

import com.velo.magasin.dto.LoginResponse;
import com.velo.magasin.dto.UtilisateurDto;
import com.velo.magasin.dto.UtilisateurRequest;
import com.velo.magasin.model.Magasin;
import com.velo.magasin.model.Role;
import com.velo.magasin.model.Utilisateur;
import com.velo.magasin.repository.UtilisateurRepository;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.security.JwtService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurs;
    private final MagasinService magasinService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UtilisateurService(UtilisateurRepository utilisateurs, MagasinService magasinService,
                              PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.utilisateurs = utilisateurs;
        this.magasinService = magasinService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String username, String password) {
        Utilisateur u = utilisateurs.findByUsername(username)
                .filter(Utilisateur::isActif)
                .filter(x -> passwordEncoder.matches(password, x.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));
        return new LoginResponse(jwtService.generer(CurrentUser.of(u)), UtilisateurDto.from(u));
    }

    @Transactional(readOnly = true)
    public UtilisateurDto moi(CurrentUser user) {
        return UtilisateurDto.from(get(user.id()));
    }

    /** Direction : tous les utilisateurs. Responsable : l'équipe de son magasin. */
    @Transactional(readOnly = true)
    public List<UtilisateurDto> lister(CurrentUser user) {
        if (user.isAdmin()) {
            return utilisateurs.findAll().stream().map(UtilisateurDto::from).toList();
        }
        if (user.role() == Role.RESPONSABLE) {
            return utilisateurs.findByMagasinIdOrderByNomComplet(user.magasinId()).stream()
                    .map(UtilisateurDto::from).toList();
        }
        throw new AccessDeniedException("Accès réservé aux responsables");
    }

    /** La direction crée tout type de compte ; un responsable ne peut créer que des vendeurs pour son magasin. */
    public UtilisateurDto creer(CurrentUser user, UtilisateurRequest req) {
        Long magasinId = req.magasinId();
        if (!user.isAdmin()) {
            if (user.role() != Role.RESPONSABLE || req.role() != Role.VENDEUR) {
                throw new AccessDeniedException("Un responsable ne peut créer que des vendeurs");
            }
            magasinId = user.magasinId();
        }
        if (utilisateurs.existsByUsername(req.username())) {
            throw new BusinessException("Le nom d'utilisateur " + req.username() + " est déjà pris");
        }
        Magasin magasin = null;
        if (req.role() != Role.ADMIN) {
            if (magasinId == null) {
                throw new BusinessException("Un responsable ou un vendeur doit être rattaché à un magasin");
            }
            magasin = magasinService.get(magasinId);
        }
        var u = new Utilisateur(req.username(), passwordEncoder.encode(req.password()), req.nomComplet(), req.role(), magasin);
        return UtilisateurDto.from(utilisateurs.save(u));
    }

    public UtilisateurDto changerActivation(CurrentUser user, Long id, boolean actif) {
        Utilisateur cible = get(id);
        boolean vendeurDeMonMagasin = user.role() == Role.RESPONSABLE && cible.getRole() == Role.VENDEUR
                && cible.getMagasin() != null && cible.getMagasin().getId().equals(user.magasinId());
        if (!user.isAdmin() && !vendeurDeMonMagasin) {
            throw new AccessDeniedException("Action non autorisée");
        }
        if (cible.getId().equals(user.id())) {
            throw new BusinessException("Vous ne pouvez pas désactiver votre propre compte");
        }
        cible.setActif(actif);
        return UtilisateurDto.from(cible);
    }

    private Utilisateur get(Long id) {
        return utilisateurs.findById(id).orElseThrow(() -> new NotFoundException("Utilisateur", id));
    }
}
