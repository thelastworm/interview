const db = require('../config/database');
const { NotFoundError, BusinessError } = require('../errors');
const acces = require('./acces');

function composantsOf(produitId) {
  return db.prepare(`
    SELECT c.piece_id AS pieceId, p.nom AS pieceNom, c.quantite
    FROM composant c
    JOIN produit p ON p.id = c.piece_id
    WHERE c.velo_id = ?
  `).all(produitId);
}

function toDto(row) {
  return {
    id: row.id,
    reference: row.reference,
    nom: row.nom,
    type: row.type,
    prixVente: row.prix_vente,
    fournisseurId: row.fournisseur_id,
    fournisseurNom: row.fournisseur_nom || null,
    composants: row.type === 'VELO' ? composantsOf(row.id) : [],
  };
}

const PRODUIT_QUERY = `
  SELECT p.id, p.reference, p.nom, p.type, p.prix_vente, p.fournisseur_id,
         f.nom AS fournisseur_nom
  FROM produit p
  LEFT JOIN fournisseur f ON f.id = p.fournisseur_id
`;

function lister(type) {
  if (type) {
    return db.prepare(PRODUIT_QUERY + ' WHERE p.type = ? ORDER BY p.nom').all(type).map(toDto);
  }
  return db.prepare(PRODUIT_QUERY + ' ORDER BY p.nom').all().map(toDto);
}

function creer(user, req) {
  acces.exigerUsine(user);
  if (db.prepare('SELECT id FROM produit WHERE reference = ?').get(req.reference)) {
    throw new BusinessError(`La référence ${req.reference} existe déjà`);
  }
  const fournisseurId = resoudreFournisseurId(req);
  const result = db.prepare(
    'INSERT INTO produit (reference, nom, type, prix_vente, fournisseur_id) VALUES (?, ?, ?, ?, ?)'
  ).run(req.reference, req.nom, req.type, req.prixVente, fournisseurId);
  const produitId = result.lastInsertRowid;
  appliquerNomenclature(produitId, req.type, req.composants);
  return toDto(db.prepare(PRODUIT_QUERY + ' WHERE p.id = ?').get(produitId));
}

function modifier(user, id, req) {
  acces.exigerUsine(user);
  get(id); // vérifie l'existence
  const fournisseurId = resoudreFournisseurId(req);
  db.prepare(
    'UPDATE produit SET nom = ?, prix_vente = ?, fournisseur_id = ? WHERE id = ?'
  ).run(req.nom, req.prixVente, fournisseurId, id);
  db.prepare('DELETE FROM composant WHERE velo_id = ?').run(id);
  appliquerNomenclature(id, req.type, req.composants);
  return toDto(db.prepare(PRODUIT_QUERY + ' WHERE p.id = ?').get(id));
}

/** Récupère un produit par son id (retourne l'objet brut DB, utilisé en interne). */
function get(id) {
  const row = db.prepare(PRODUIT_QUERY + ' WHERE p.id = ?').get(id);
  if (!row) throw new NotFoundError('Produit', id);
  return row;
}

function resoudreFournisseurId(req) {
  if (req.type === 'VELO' || req.fournisseurId == null) return null;
  const f = db.prepare('SELECT id FROM fournisseur WHERE id = ?').get(req.fournisseurId);
  if (!f) throw new NotFoundError('Fournisseur', req.fournisseurId);
  return req.fournisseurId;
}

function appliquerNomenclature(produitId, type, composants) {
  if (type !== 'VELO' || !composants || composants.length === 0) return;
  const insert = db.prepare('INSERT INTO composant (velo_id, piece_id, quantite) VALUES (?, ?, ?)');
  for (const c of composants) {
    const piece = db.prepare('SELECT id, type FROM produit WHERE id = ?').get(c.pieceId);
    if (!piece) throw new NotFoundError('Produit', c.pieceId);
    if (piece.type !== 'PIECE') {
      throw new BusinessError('Un vélo ne peut être composé que de pièces détachées');
    }
    insert.run(produitId, c.pieceId, c.quantite);
  }
}

module.exports = { lister, creer, modifier, get };
