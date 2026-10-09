const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const usineService = require('../services/usineService');

const router = Router();

router.get('/commandes', requireAuth, (req, res, next) => {
  try {
    res.json(usineService.listerCommandes(req.user));
  } catch (err) {
    next(err);
  }
});

router.post('/commandes', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(usineService.passerCommande(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/commandes/:id/reception', requireAuth, (req, res, next) => {
  try {
    res.json(usineService.receptionner(req.user, Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

router.post('/commandes/:id/annulation', requireAuth, (req, res, next) => {
  try {
    res.json(usineService.annuler(req.user, Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

router.get('/assemblages', requireAuth, (req, res, next) => {
  try {
    res.json(usineService.listerAssemblages(req.user));
  } catch (err) {
    next(err);
  }
});

router.post('/assemblages', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(usineService.assembler(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
