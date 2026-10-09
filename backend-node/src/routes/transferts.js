const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const transfertService = require('../services/transfertService');

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    res.json(transfertService.lister(req.user));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(transfertService.demander(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/validation', requireAuth, (req, res, next) => {
  try {
    res.json(transfertService.valider(req.user, Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/refus', requireAuth, (req, res, next) => {
  try {
    res.json(transfertService.refuser(req.user, Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
