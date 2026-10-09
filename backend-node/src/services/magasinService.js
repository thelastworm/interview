const db = require('../config/database');
const { NotFoundError } = require('../errors');

function lister() {
  return db.prepare('SELECT id, nom, ville, type FROM magasin ORDER BY nom').all();
}

function get(id) {
  const m = db.prepare('SELECT id, nom, ville, type FROM magasin WHERE id = ?').get(id);
  if (!m) throw new NotFoundError('Magasin', id);
  return m;
}

function central() {
  const m = db.prepare("SELECT id, nom, ville, type FROM magasin WHERE type = 'CENTRAL' LIMIT 1").get();
  if (!m) throw new Error('Aucun magasin central configuré');
  return m;
}

module.exports = { lister, get, central };
