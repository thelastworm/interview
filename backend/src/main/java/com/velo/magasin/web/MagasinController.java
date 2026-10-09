package com.velo.magasin.web;

import com.velo.magasin.dto.MagasinDto;
import com.velo.magasin.dto.StockDto;
import com.velo.magasin.dto.TableauDeBordDto;
import com.velo.magasin.security.CurrentUser;
import com.velo.magasin.service.MagasinService;
import com.velo.magasin.service.StockService;
import com.velo.magasin.service.TableauDeBordService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MagasinController {

    private final MagasinService magasinService;
    private final StockService stockService;
    private final TableauDeBordService tableauDeBordService;

    public MagasinController(MagasinService magasinService, StockService stockService,
                             TableauDeBordService tableauDeBordService) {
        this.magasinService = magasinService;
        this.stockService = stockService;
        this.tableauDeBordService = tableauDeBordService;
    }

    @GetMapping("/magasins")
    public List<MagasinDto> magasins() {
        return magasinService.lister();
    }

    /** Sans paramètre : stock du magasin de l'utilisateur (ou tous les stocks pour la direction). */
    @GetMapping("/stocks")
    public List<StockDto> stocks(@AuthenticationPrincipal CurrentUser user,
                                 @RequestParam(required = false) Long magasinId) {
        return stockService.lister(user, magasinId);
    }

    @PutMapping("/stocks/{id}/seuil")
    public StockDto seuil(@AuthenticationPrincipal CurrentUser user, @PathVariable Long id, @RequestParam int valeur) {
        return stockService.modifierSeuil(user, id, valeur);
    }

    @GetMapping("/tableau-de-bord")
    public TableauDeBordDto tableauDeBord(@AuthenticationPrincipal CurrentUser user) {
        return tableauDeBordService.calculer(user);
    }
}
