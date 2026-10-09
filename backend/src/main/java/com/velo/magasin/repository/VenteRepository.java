package com.velo.magasin.repository;

import com.velo.magasin.model.Vente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenteRepository extends JpaRepository<Vente, Long> {

    List<Vente> findAllByOrderByDateDesc();

    List<Vente> findByMagasinIdOrderByDateDesc(Long magasinId);

    List<Vente> findByVendeurIdOrderByDateDesc(Long vendeurId);
}
