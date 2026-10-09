package com.velo.magasin.repository;

import com.velo.magasin.model.Transfert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransfertRepository extends JpaRepository<Transfert, Long> {

    List<Transfert> findAllByOrderByDateDemandeDesc();

    List<Transfert> findByDestinationIdOrderByDateDemandeDesc(Long magasinId);
}
