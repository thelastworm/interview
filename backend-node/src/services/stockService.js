const db = require('../config/database');
const { NotFoundError, BusinessError, AccessDeniedError } = require('../errors');

const STOCK_QUERY = `
  SELECT s.id, s.magasin_id, m.nom AS magasin_nom,
         s.produit_id, p.reference AS produit_reference, p.nom AS produit_nom,
         p.type AS produit_type, p.prix_vente,
         s.quantite, s.seuil_alerte, s.version
  FROM stock s
  JOIN magasin m ON m.id = s.magasin_id
  JOIN produit p ON p.id = s.produit_id
`;

function toDto(row) {
  return {
    id: row.id,
    magasinId: row.magasin_id,
    magasinNom: row.magasin_nom,
    produitId: row.produit_id,
    produitReference: row.produit_reference,
    produitNom: row.produit_nom,
    produitType: row.produit_type,
    prixVente: row.prix_vente,
    quantite: row.quantite,
    seuilAlerte: row.seuil_alerte,
    stockBas: row.quantite <= row.seuil_alerte,
  };
}

function lister(user, magasinId) {
  const cible = magasinId != null ? Number(magasinId) : user.magasinId;
  if (cible == null) {
    return db.prepare(STOCK_QUERY + ' ORDER BY m.nom, p.nom').all().map(toDto);
  }
  if (!user.peutGererUsine() && cible !== user.magasinId) {
    throw new AccessDeniedError('Accès limité à votre magasin');
  }
  return db.prepare(STOCK_QUERY + ' WHERE s.magasin_id = ? ORDER BY p.nom').all(cible).map(toDto);
}

function modifierSeuil(user, stockId, seuil) {
  const row = db.prepare(STOCK_QUERY + ' WHERE s.id = ?').get(stockId);
  if (!row) throw new NotFoundError('Stock', stockId);
  const responsableDuMagasin =
    user.role === 'RESPONSABLE' && row.magasin_id === user.magasinId;
  if (!user.isAdmin() && !responsableDuMagasin) {
    throw new AccessDeniedError('Seul le responsable du magasin peut modifier le seuil');
  }
  if (seuil < 0) throw new BusinessError('Le seuil doit être positif');
  db.prepare('UPDATE stock SET seuil_alerte = ? WHERE id = ?').run(seuil, stockId);
  return toDto(db.prepare(STOCK_QUERY + ' WHERE s.id = ?').get(stockId));
}

/** Ajoute de la quantité au stock, crée l'entrée si elle n'existe pas encore. */
function ajouter(magasin, produit, quantite) {
  const existing = db
    .prepare('SELECT id FROM stock WHERE magasin_id = ? AND produit_id = ?')
    .get(magasin.id, produit.id);
  if (existing) {
    db.prepare('UPDATE stock SET quantite = quantite + ?, version = version + 1 WHERE id = ?')
      .run(quantite, existing.id);
  } else {
    db.prepare(
      'INSERT INTO stock (magasin_id, produit_id, quantite, seuil_alerte) VALUES (?, ?, ?, 0)'
    ).run(magasin.id, produit.id, quantite);
  }
}

/** Retire de la quantité du stock. Lève BusinessError si stock insuffisant. */
function retirer(magasin, produit, quantite) {
  const stock = db
    .prepare('SELECT id, quantite FROM stock WHERE magasin_id = ? AND produit_id = ?')
    .get(magasin.id, produit.id);
  const dispo = stock ? stock.quantite : 0;
  if (!stock || dispo < quantite) {
    throw new BusinessError(
      `Stock insuffisant pour « ${produit.nom} » à ${magasin.nom} : ${quantite} demandé(s), ${dispo} disponible(s)`
    );
  }
  db.prepare('UPDATE stock SET quantite = quantite - ?, version = version + 1 WHERE id = ?')
    .run(quantite, stock.id);
}

module.exports = { lister, modifierSeuil, ajouter, retirer };
