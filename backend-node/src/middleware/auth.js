const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.APP_JWT_SECRET || 'velo-magasin-node-secret-key-au-moins-256-bits';
const JWT_EXPIRATION = process.env.APP_JWT_EXPIRATION_MINUTES
  ? `${process.env.APP_JWT_EXPIRATION_MINUTES}m`
  : '480m';

function generateToken(username, role) {
  return jwt.sign({ sub: username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, detail: 'Authentification requise' });
  }
  const token = auth.slice(7);
  let username;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    username = payload.sub;
  } catch {
    return res.status(401).json({ status: 401, detail: 'Jeton invalide ou expiré' });
  }

  const row = db.prepare(`
    SELECT u.id, u.username, u.role, u.actif, u.magasin_id, m.type AS magasin_type
    FROM utilisateur u
    LEFT JOIN magasin m ON m.id = u.magasin_id
    WHERE u.username = ?
  `).get(username);

  if (!row || !row.actif) {
    return res.status(401).json({ status: 401, detail: 'Compte inactif ou introuvable' });
  }

  req.user = {
    id: row.id,
    username: row.username,
    role: row.role,
    magasinId: row.magasin_id,
    magasinCentral: row.magasin_type === 'CENTRAL',
    isAdmin() { return row.role === 'ADMIN'; },
    peutGererUsine() {
      return row.role === 'ADMIN' || (row.role === 'RESPONSABLE' && row.magasin_type === 'CENTRAL');
    },
  };
  next();
}

module.exports = { requireAuth, generateToken };
