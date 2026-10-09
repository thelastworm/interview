const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { NotFoundError, BusinessError, AccessDeniedError, AuthError } = require('../errors');
const { generateToken } = require('../middleware/auth');
const magasinService = require('./magasinService');

function toDto(row) {
  return {
    id: row.id,
    username: row.username,
    nomComplet: row.nom_complet,
    role: row.role,
    magasinId: row.magasin_id,
    magasinNom: row.magasin_nom || null,
    actif: row.actif === 1 || row.actif === true,
  };
}

const USER_QUERY = `
  SELECT u.id, u.username, u.password, u.nom_complet, u.role, u.magasin_id, u.actif, m.nom AS magasin_nom
  FROM utilisateur u
  LEFT JOIN magasin m ON m.id = u.magasin_id
`;

function login(username, password) {
  const row = db.prepare(USER_QUERY + ' WHERE u.username = ?').get(username);
  if (!row || !row.actif || !bcrypt.compareSync(password, row.password)) {
    throw new AuthError('Identifiants invalides');
  }
  const token = generateToken(row.username, row.role);
  return { token, utilisateur: toDto(row) };
}

function moi(user) {
  return toDto(get(user.id));
}

function lister(user) {
  if (user.isAdmin()) {
    return db.prepare(USER_QUERY + ' ORDER BY u.nom_complet').all().map(toDto);
  }
  if (user.role === 'RESPONSABLE') {
    return db.prepare(USER_QUERY + ' WHERE u.magasin_id = ? ORDER BY u.nom_complet')
      .all(user.magasinId).map(toDto);
  }
  throw new AccessDeniedError('Accès réservé aux responsables');
}

function creer(user, req) {
  let magasinId = req.magasinId;
  if (!user.isAdmin()) {
    if (user.role !== 'RESPONSABLE' || req.role !== 'VENDEUR') {
      throw new AccessDeniedError('Un responsable ne peut créer que des vendeurs');
    }
    magasinId = user.magasinId;
  }
  if (db.prepare('SELECT id FROM utilisateur WHERE username = ?').get(req.username)) {
    throw new BusinessError(`Le nom d'utilisateur ${req.username} est déjà pris`);
  }
  if (req.role !== 'ADMIN') {
    if (magasinId == null) {
      throw new BusinessError('Un responsable ou un vendeur doit être rattaché à un magasin');
    }
    magasinService.get(magasinId); // vérifie l'existence
  } else {
    magasinId = null;
  }
  const hash = bcrypt.hashSync(req.password, 10);
  const result = db.prepare(
    'INSERT INTO utilisateur (username, password, nom_complet, role, magasin_id) VALUES (?, ?, ?, ?, ?)'
  ).run(req.username, hash, req.nomComplet, req.role, magasinId);
  return toDto(db.prepare(USER_QUERY + ' WHERE u.id = ?').get(result.lastInsertRowid));
}

function changerActivation(user, id, actif) {
  const cible = get(id);
  const vendeurDeMonMagasin =
    user.role === 'RESPONSABLE' &&
    cible.role === 'VENDEUR' &&
    cible.magasin_id === user.magasinId;
  if (!user.isAdmin() && !vendeurDeMonMagasin) {
    throw new AccessDeniedError('Action non autorisée');
  }
  if (cible.id === user.id) {
    throw new BusinessError('Vous ne pouvez pas désactiver votre propre compte');
  }
  db.prepare('UPDATE utilisateur SET actif = ? WHERE id = ?').run(actif ? 1 : 0, id);
  return toDto(db.prepare(USER_QUERY + ' WHERE u.id = ?').get(id));
}

function get(id) {
  const row = db.prepare(USER_QUERY + ' WHERE u.id = ?').get(id);
  if (!row) throw new NotFoundError('Utilisateur', id);
  return row;
}

module.exports = { login, moi, lister, creer, changerActivation };
