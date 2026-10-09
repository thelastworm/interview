package com.velo.magasin.repository;

import com.velo.magasin.model.Magasin;
import com.velo.magasin.model.TypeMagasin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MagasinRepository extends JpaRepository<Magasin, Long> {

    Optional<Magasin> findFirstByType(TypeMagasin type);
}
