const db = require('../config/database');
const { AccessDeniedError } = require('../errors');
const magasinService = require('./magasinService');
const produitService = require('./produitService');
const stockService = require('./stockService');

const VENTE_QUERY = `
  SELECT v.id, v.magasin_id, m.nom AS magasin_nom,
         v.vendeur_id, u.nom_complet AS vendeur_nom,
         v.client, v.date
  FROM vente v
  JOIN magasin m ON m.id = v.magasin_id
  JOIN utilisateur u ON u.id = v.vendeur_id
`;

function toDto(row) {
  const lignes = db.prepare(`
    SELECT lv.produit_id AS produitId, p.nom AS produitNom,
           lv.quantite, lv.prix_unitaire AS prixUnitaire
    FROM ligne_vente lv
    JOIN produit p ON p.id = lv.produit_id
    WHERE lv.vente_id = ?
  `).all(row.id);

  const total = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);
  return {
    id: row.id,
    magasinId: row.magasin_id,
    magasinNom: row.magasin_nom,
    vendeur: row.vendeur_nom,
    client: row.client || null,
    date: row.date,
    lignes: lignes.map(l => ({
      produitId: l.produitId,
      produitNom: l.produitNom,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire,
    })),
    total,
  };
}

function lister(user) {
  switch (user.role) {
    case 'ADMIN':
      return db.prepare(VENTE_QUERY + ' ORDER BY v.date DESC').all().map(toDto);
    case 'RESPONSABLE':
      return db.prepare(VENTE_QUERY + ' WHERE v.magasin_id = ? ORDER BY v.date DESC')
        .all(user.magasinId).map(toDto);
    case 'VENDEUR':
      return db.prepare(VENTE_QUERY + ' WHERE v.vendeur_id = ? ORDER BY v.date DESC')
        .all(user.id).map(toDto);
  }
}

const vendre = db.transaction((user, req) => {
  if (user.isAdmin() || user.magasinId == null) {
    throw new AccessDeniedError('Une vente est réalisée par un vendeur ou un responsable de magasin');
  }
  const magasin = magasinService.get(user.magasinId);
  const venteResult = db.prepare(
    'INSERT INTO vente (magasin_id, vendeur_id, client) VALUES (?, ?, ?)'
  ).run(magasin.id, user.id, req.client || null);
  const venteId = venteResult.lastInsertRowid;

  for (const l of req.lignes) {
    const produit = produitService.get(l.produitId);
    stockService.retirer(magasin, produit, l.quantite);
    db.prepare(
      'INSERT INTO ligne_vente (vente_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)'
    ).run(venteId, l.produitId, l.quantite, produit.prix_vente);
  }
  return toDto(db.prepare(VENTE_QUERY + ' WHERE v.id = ?').get(venteId));
});

module.exports = { lister, vendre };
