package com.velo.magasin.service;

import com.velo.magasin.dto.MagasinDto;
import com.velo.magasin.model.Magasin;
import com.velo.magasin.model.TypeMagasin;
import com.velo.magasin.repository.MagasinRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MagasinService {

    private final MagasinRepository magasins;

    public MagasinService(MagasinRepository magasins) {
        this.magasins = magasins;
    }

    public List<MagasinDto> lister() {
        return magasins.findAll().stream().map(MagasinDto::from).toList();
    }

    Magasin get(Long id) {
        return magasins.findById(id).orElseThrow(() -> new NotFoundException("Magasin", id));
    }

    Magasin central() {
        return magasins.findFirstByType(TypeMagasin.CENTRAL)
                .orElseThrow(() -> new IllegalStateException("Aucun magasin central configuré"));
    }
}
