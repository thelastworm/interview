package com.velo.magasin.service;

import com.velo.magasin.dto.FournisseurDto;
import com.velo.magasin.model.Fournisseur;
import com.velo.magasin.repository.FournisseurRepository;
import com.velo.magasin.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FournisseurService {

    private final FournisseurRepository fournisseurs;

    public FournisseurService(FournisseurRepository fournisseurs) {
        this.fournisseurs = fournisseurs;
    }

    @Transactional(readOnly = true)
    public List<FournisseurDto> lister(CurrentUser user) {
        Acces.exigerUsine(user);
        return fournisseurs.findAll().stream().map(FournisseurDto::from).toList();
    }

    public FournisseurDto creer(CurrentUser user, FournisseurDto dto) {
        Acces.exigerUsine(user);
        return FournisseurDto.from(fournisseurs.save(new Fournisseur(dto.nom(), dto.email(), dto.telephone())));
    }

    public FournisseurDto modifier(CurrentUser user, Long id, FournisseurDto dto) {
        Acces.exigerUsine(user);
        Fournisseur f = get(id);
        f.setNom(dto.nom());
        f.setEmail(dto.email());
        f.setTelephone(dto.telephone());
        return FournisseurDto.from(f);
    }

    Fournisseur get(Long id) {
        return fournisseurs.findById(id).orElseThrow(() -> new NotFoundException("Fournisseur", id));
    }
}
