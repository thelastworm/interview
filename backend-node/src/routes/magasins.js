const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const magasinService = require('../services/magasinService');
const stockService = require('../services/stockService');
const tableauDeBordService = require('../services/tableauDeBordService');

const router = Router();

router.get('/magasins', requireAuth, (req, res, next) => {
  try {
    res.json(magasinService.lister());
  } catch (err) {
    next(err);
  }
});

router.get('/stocks', requireAuth, (req, res, next) => {
  try {
    const magasinId = req.query.magasinId ? Number(req.query.magasinId) : null;
    res.json(stockService.lister(req.user, magasinId));
  } catch (err) {
    next(err);
  }
});

router.put('/stocks/:id/seuil', requireAuth, (req, res, next) => {
  try {
    const valeur = parseInt(req.query.valeur, 10);
    if (isNaN(valeur)) {
      return res.status(400).json({ status: 400, detail: 'valeur doit être un entier' });
    }
    res.json(stockService.modifierSeuil(req.user, Number(req.params.id), valeur));
  } catch (err) {
    next(err);
  }
});

router.get('/tableau-de-bord', requireAuth, (req, res, next) => {
  try {
    res.json(tableauDeBordService.calculer(req.user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
