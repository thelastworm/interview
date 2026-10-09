const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const venteService = require('../services/venteService');

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    res.json(venteService.lister(req.user));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(venteService.vendre(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
