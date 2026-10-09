const db = require('../config/database');
const { NotFoundError } = require('../errors');
const acces = require('./acces');

function toDto(row) {
  return { id: row.id, nom: row.nom, email: row.email, telephone: row.telephone };
}

function lister(user) {
  acces.exigerUsine(user);
  return db.prepare('SELECT id, nom, email, telephone FROM fournisseur ORDER BY nom').all().map(toDto);
}

function creer(user, dto) {
  acces.exigerUsine(user);
  const result = db.prepare(
    'INSERT INTO fournisseur (nom, email, telephone) VALUES (?, ?, ?)'
  ).run(dto.nom, dto.email, dto.telephone);
  return toDto(db.prepare('SELECT id, nom, email, telephone FROM fournisseur WHERE id = ?').get(result.lastInsertRowid));
}

function modifier(user, id, dto) {
  acces.exigerUsine(user);
  get(id);
  db.prepare('UPDATE fournisseur SET nom = ?, email = ?, telephone = ? WHERE id = ?')
    .run(dto.nom, dto.email, dto.telephone, id);
  return toDto(db.prepare('SELECT id, nom, email, telephone FROM fournisseur WHERE id = ?').get(id));
}

function get(id) {
  const f = db.prepare('SELECT id, nom, email, telephone FROM fournisseur WHERE id = ?').get(id);
  if (!f) throw new NotFoundError('Fournisseur', id);
  return f;
}

module.exports = { lister, creer, modifier, get };
