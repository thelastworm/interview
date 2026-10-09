package com.velo.magasin.service;

import com.velo.magasin.dto.StockDto;
import com.velo.magasin.model.Magasin;
import com.velo.magasin.model.Produit;
import com.velo.magasin.model.Role;
import com.velo.magasin.model.Stock;
import com.velo.magasin.repository.StockRepository;
import com.velo.magasin.security.CurrentUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class StockService {

    private final StockRepository stocks;

    public StockService(StockRepository stocks) {
        this.stocks = stocks;
    }

    @Transactional(readOnly = true)
    public List<StockDto> lister(CurrentUser user, Long magasinId) {
        Long cible = magasinId != null ? magasinId : user.magasinId();
        if (cible == null) { // administrateur sans filtre : tous les stocks
            return stocks.findAll().stream()
                    .sorted(Comparator.comparing((Stock s) -> s.getMagasin().getNom())
                            .thenComparing(s -> s.getProduit().getNom()))
                    .map(StockDto::from).toList();
        }
        Acces.exigerLectureMagasin(user, cible);
        return stocks.findByMagasinIdOrderByProduitNom(cible).stream().map(StockDto::from).toList();
    }

    public StockDto modifierSeuil(CurrentUser user, Long stockId, int seuil) {
        Stock stock = stocks.findById(stockId).orElseThrow(() -> new NotFoundException("Stock", stockId));
        boolean responsableDuMagasin = user.role() == Role.RESPONSABLE
                && stock.getMagasin().getId().equals(user.magasinId());
        if (!user.isAdmin() && !responsableDuMagasin) {
            throw new AccessDeniedException("Seul le responsable du magasin peut modifier le seuil");
        }
        if (seuil < 0) {
            throw new BusinessException("Le seuil doit être positif");
        }
        stock.setSeuilAlerte(seuil);
        return StockDto.from(stock);
    }

    void ajouter(Magasin magasin, Produit produit, int quantite) {
        Stock stock = stocks.findByMagasinIdAndProduitId(magasin.getId(), produit.getId())
                .orElseGet(() -> stocks.save(new Stock(magasin, produit, 0, 0)));
        stock.ajouter(quantite);
    }

    void retirer(Magasin magasin, Produit produit, int quantite) {
        Stock stock = stocks.findByMagasinIdAndProduitId(magasin.getId(), produit.getId())
                .orElseThrow(() -> stockInsuffisant(magasin, produit, quantite, 0));
        if (stock.getQuantite() < quantite) {
            throw stockInsuffisant(magasin, produit, quantite, stock.getQuantite());
        }
        stock.retirer(quantite);
    }

    private BusinessException stockInsuffisant(Magasin m, Produit p, int demande, int dispo) {
        return new BusinessException("Stock insuffisant pour « %s » à %s : %d demandé(s), %d disponible(s)"
                .formatted(p.getNom(), m.getNom(), demande, dispo));
    }
}
