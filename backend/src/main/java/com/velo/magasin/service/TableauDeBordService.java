package com.velo.magasin.service;

import com.velo.magasin.dto.TableauDeBordDto;
import com.velo.magasin.dto.VenteDto;
import com.velo.magasin.model.StatutTransfert;
import com.velo.magasin.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional(readOnly = true)
public class TableauDeBordService {

    private final VenteService venteService;
    private final StockService stockService;
    private final TransfertService transfertService;

    public TableauDeBordService(VenteService venteService, StockService stockService, TransfertService transfertService) {
        this.venteService = venteService;
        this.stockService = stockService;
        this.transfertService = transfertService;
    }

    /** Indicateurs calculés sur le périmètre visible par l'utilisateur. */
    public TableauDeBordDto calculer(CurrentUser user) {
        var ventes = venteService.lister(user);
        var stocks = stockService.lister(user, null);
        var transferts = transfertService.lister(user);
        return new TableauDeBordDto(
                ventes.size(),
                ventes.stream().map(VenteDto::total).reduce(BigDecimal.ZERO, BigDecimal::add),
                stocks.stream().mapToInt(s -> s.quantite()).sum(),
                stocks.stream().filter(s -> s.stockBas()).count(),
                transferts.stream().filter(t -> t.statut() == StatutTransfert.DEMANDE).count());
    }
}
