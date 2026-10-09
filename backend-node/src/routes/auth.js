const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const utilisateurService = require('../services/utilisateurService');

const router = Router();

router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: 400, detail: 'username et password sont obligatoires' });
    }
    res.json(utilisateurService.login(username, password));
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res, next) => {
  try {
    res.json(utilisateurService.moi(req.user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
