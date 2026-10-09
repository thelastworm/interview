const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const utilisateurService = require('../services/utilisateurService');

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    res.json(utilisateurService.lister(req.user));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, (req, res, next) => {
  try {
    res.status(201).json(utilisateurService.creer(req.user, req.body));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/actif', requireAuth, (req, res, next) => {
  try {
    const valeur = req.query.valeur === 'true' || req.query.valeur === true;
    res.json(utilisateurService.changerActivation(req.user, Number(req.params.id), valeur));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
