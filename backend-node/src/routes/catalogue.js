const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const produitService = require('../services/produitService');
const fournisseurService = require('../services/fournisseurService');

const router = Router();

router.get('/produits', (req, res, next) => {
  try {
    const type = req.query.type || null;
    res.json(produitService.lister(type));
  } catch (err) {
    next(err);
  }
});

router.post('/produits', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(produitService.creer(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

router.put('/produits/:id', requireAuth, (req, res, next) => {
  try {
    res.json(produitService.modifier(req.user, Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

router.get('/fournisseurs', requireAuth, (req, res, next) => {
  try {
    res.json(fournisseurService.lister(req.user));
  } catch (err) {
    next(err);
  }
});

router.post('/fournisseurs', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(fournisseurService.creer(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

router.put('/fournisseurs/:id', requireAuth, (req, res, next) => {
  try {
    res.json(fournisseurService.modifier(req.user, Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
