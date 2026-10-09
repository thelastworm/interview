package com.velo.magasin.repository;

import com.velo.magasin.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByMagasinIdOrderByProduitNom(Long magasinId);

    Optional<Stock> findByMagasinIdAndProduitId(Long magasinId, Long produitId);
}
