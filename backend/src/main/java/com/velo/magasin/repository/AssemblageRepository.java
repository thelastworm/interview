package com.velo.magasin.repository;

import com.velo.magasin.model.Assemblage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssemblageRepository extends JpaRepository<Assemblage, Long> {

    List<Assemblage> findAllByOrderByDateDesc();
}
