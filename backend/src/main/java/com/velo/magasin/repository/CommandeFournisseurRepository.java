package com.velo.magasin.repository;

import com.velo.magasin.model.CommandeFournisseur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandeFournisseurRepository extends JpaRepository<CommandeFournisseur, Long> {

    List<CommandeFournisseur> findAllByOrderByDateCommandeDesc();
}
