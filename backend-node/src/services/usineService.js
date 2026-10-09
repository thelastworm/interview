const db = require('../config/database');
const { NotFoundError, BusinessError } = require('../errors');
const acces = require('./acces');
const magasinService = require('./magasinService');
const produitService = require('./produitService');
const stockService = require('./stockService');

// ── DTOs ────────────────────────────────────────────────────────────────────

function commandeToDto(row) {
  const lignes = db.prepare(`
    SELECT lc.id, lc.piece_id AS produitId, p.nom AS produitNom,
           lc.quantite, lc.prix_unitaire AS prixUnitaire
    FROM ligne_commande lc
    JOIN produit p ON p.id = lc.piece_id
    WHERE lc.commande_id = ?
  `).all(row.id);

  const total = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);
  return {
    id: row.id,
    fournisseurId: row.fournisseur_id,
    fournisseurNom: row.fournisseur_nom,
    statut: row.statut,
    dateCommande: row.date_commande,
    dateReception: row.date_reception,
    creePar: row.cree_par_nom,
    lignes: lignes.map(l => ({ produitId: l.produitId, produitNom: l.produitNom, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
    total,
  };
}

function assemblageToDto(row) {
  return {
    id: row.id,
    veloId: row.velo_id,
    veloNom: row.velo_nom,
    quantite: row.quantite,
    date: row.date,
    operateur: row.operateur_nom,
  };
}

const COMMANDE_QUERY = `
  SELECT cf.id, cf.fournisseur_id, f.nom AS fournisseur_nom,
         cf.statut, cf.date_commande, cf.date_reception,
         u.nom_complet AS cree_par_nom
  FROM commande_fournisseur cf
  JOIN fournisseur f ON f.id = cf.fournisseur_id
  JOIN utilisateur u ON u.id = cf.commandeur_id
`;

const ASSEMBLAGE_QUERY = `
  SELECT a.id, a.velo_id, p.nom AS velo_nom, a.quantite, a.date,
         u.nom_complet AS operateur_nom
  FROM assemblage a
  JOIN produit p ON p.id = a.velo_id
  JOIN utilisateur u ON u.id = a.operateur_id
`;

// ── Commandes fournisseurs ───────────────────────────────────────────────────

function listerCommandes(user) {
  acces.exigerUsine(user);
  return db.prepare(COMMANDE_QUERY + ' ORDER BY cf.date_commande DESC').all().map(commandeToDto);
}

const passerCommande = db.transaction((user, req) => {
  acces.exigerUsine(user);
  const fournisseur = db.prepare('SELECT id, nom FROM fournisseur WHERE id = ?').get(req.fournisseurId);
  if (!fournisseur) throw new NotFoundError('Fournisseur', req.fournisseurId);

  const cmdResult = db.prepare(
    'INSERT INTO commande_fournisseur (fournisseur_id, commandeur_id) VALUES (?, ?)'
  ).run(req.fournisseurId, user.id);
  const commandeId = cmdResult.lastInsertRowid;

  for (const l of req.lignes) {
    const piece = produitService.get(l.pieceId);
    if (piece.type !== 'PIECE') {
      throw new BusinessError('Seules des pièces détachées peuvent être commandées aux fournisseurs');
    }
    db.prepare(
      'INSERT INTO ligne_commande (commande_id, piece_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)'
    ).run(commandeId, l.pieceId, l.quantite, l.prixUnitaire);
  }
  return commandeToDto(db.prepare(COMMANDE_QUERY + ' WHERE cf.id = ?').get(commandeId));
});

const receptionner = db.transaction((user, commandeId) => {
  acces.exigerUsine(user);
  const commande = getCommande(commandeId);
  if (commande.statut !== 'EN_COURS') {
    throw new BusinessError("La commande n'est plus en cours");
  }
  const central = magasinService.central();
  const lignes = db.prepare(
    'SELECT lc.piece_id, lc.quantite FROM ligne_commande lc WHERE lc.commande_id = ?'
  ).all(commandeId);
  for (const l of lignes) {
    const piece = produitService.get(l.piece_id);
    stockService.ajouter(central, piece, l.quantite);
  }
  const now = new Date().toISOString();
  db.prepare("UPDATE commande_fournisseur SET statut = 'RECUE', date_reception = ? WHERE id = ?")
    .run(now, commandeId);
  return commandeToDto(db.prepare(COMMANDE_QUERY + ' WHERE cf.id = ?').get(commandeId));
});

const annuler = db.transaction((user, commandeId) => {
  acces.exigerUsine(user);
  const commande = getCommande(commandeId);
  if (commande.statut !== 'EN_COURS') {
    throw new BusinessError("La commande n'est plus en cours");
  }
  db.prepare("UPDATE commande_fournisseur SET statut = 'ANNULEE' WHERE id = ?").run(commandeId);
  return commandeToDto(db.prepare(COMMANDE_QUERY + ' WHERE cf.id = ?').get(commandeId));
});

function getCommande(id) {
  const row = db.prepare(COMMANDE_QUERY + ' WHERE cf.id = ?').get(id);
  if (!row) throw new NotFoundError('Commande', id);
  return row;
}

// ── Assemblage ───────────────────────────────────────────────────────────────

function listerAssemblages(user) {
  acces.exigerUsine(user);
  return db.prepare(ASSEMBLAGE_QUERY + ' ORDER BY a.date DESC').all().map(assemblageToDto);
}

const assembler = db.transaction((user, req) => {
  acces.exigerUsine(user);
  const velo = produitService.get(req.veloId);
  if (velo.type !== 'VELO') {
    throw new BusinessError('Seul un vélo peut être assemblé');
  }
  const composants = db.prepare(
    'SELECT piece_id, quantite FROM composant WHERE velo_id = ?'
  ).all(req.veloId);
  if (composants.length === 0) {
    throw new BusinessError(`Aucune nomenclature définie pour ${velo.nom}`);
  }
  const central = magasinService.central();
  for (const c of composants) {
    const piece = produitService.get(c.piece_id);
    stockService.retirer(central, piece, c.quantite * req.quantite);
  }
  stockService.ajouter(central, velo, req.quantite);
  const result = db.prepare(
    'INSERT INTO assemblage (velo_id, quantite, operateur_id) VALUES (?, ?, ?)'
  ).run(req.veloId, req.quantite, user.id);
  return assemblageToDto(db.prepare(ASSEMBLAGE_QUERY + ' WHERE a.id = ?').get(result.lastInsertRowid));
});

module.exports = { listerCommandes, passerCommande, receptionner, annuler, listerAssemblages, assembler };
