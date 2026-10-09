package com.velo.magasin.repository;

import com.velo.magasin.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Utilisateur> findByMagasinIdOrderByNomComplet(Long magasinId);
}
