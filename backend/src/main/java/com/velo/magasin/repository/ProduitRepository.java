package com.velo.magasin.repository;

import com.velo.magasin.model.Produit;
import com.velo.magasin.model.TypeProduit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByTypeOrderByNom(TypeProduit type);

    boolean existsByReference(String reference);
}
