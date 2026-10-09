const db = require('../config/database');
const { NotFoundError, BusinessError, AccessDeniedError } = require('../errors');
const acces = require('./acces');
const magasinService = require('./magasinService');
const produitService = require('./produitService');
const stockService = require('./stockService');

const TRANSFERT_QUERY = `
  SELECT t.id, t.destination_id, m.nom AS destination_nom,
         t.produit_id, p.nom AS produit_nom,
         t.quantite, t.statut, t.commentaire,
         t.date_demande, t.date_traitement,
         ud.nom_complet AS demandeur_nom,
         ut.nom_complet AS traite_par_nom
  FROM transfert t
  JOIN magasin m  ON m.id  = t.destination_id
  JOIN produit p  ON p.id  = t.produit_id
  JOIN utilisateur ud ON ud.id = t.demandeur_id
  LEFT JOIN utilisateur ut ON ut.id = t.traite_par_id
`;

function toDto(row) {
  return {
    id: row.id,
    destinationId: row.destination_id,
    destinationNom: row.destination_nom,
    produitId: row.produit_id,
    produitNom: row.produit_nom,
    quantite: row.quantite,
    statut: row.statut,
    demandeur: row.demandeur_nom,
    traitePar: row.traite_par_nom || null,
    dateDemande: row.date_demande,
    dateTraitement: row.date_traitement || null,
    commentaire: row.commentaire || null,
  };
}

function lister(user) {
  if (user.peutGererUsine()) {
    return db.prepare(TRANSFERT_QUERY + ' ORDER BY t.date_demande DESC').all().map(toDto);
  }
  return db.prepare(TRANSFERT_QUERY + ' WHERE t.destination_id = ? ORDER BY t.date_demande DESC')
    .all(user.magasinId).map(toDto);
}

const demander = db.transaction((user, req) => {
  let destinationId;
  if (user.peutGererUsine()) {
    if (req.destinationId == null) {
      throw new BusinessError('Le magasin de destination est obligatoire');
    }
    destinationId = req.destinationId;
  } else if (user.role === 'RESPONSABLE') {
    destinationId = user.magasinId;
  } else {
    throw new AccessDeniedError('Seul un responsable peut demander un réapprovisionnement');
  }
  const destination = magasinService.get(destinationId);
  if (destination.type === 'CENTRAL') {
    throw new BusinessError('Le magasin central ne peut pas être réapprovisionné par transfert');
  }
  produitService.get(req.produitId); // vérifie l'existence
  const result = db.prepare(`
    INSERT INTO transfert (destination_id, produit_id, quantite, demandeur_id, commentaire)
    VALUES (?, ?, ?, ?, ?)
  `).run(destinationId, req.produitId, req.quantite, user.id, req.commentaire || null);
  return toDto(db.prepare(TRANSFERT_QUERY + ' WHERE t.id = ?').get(result.lastInsertRowid));
});

const valider = db.transaction((user, id) => {
  acces.exigerUsine(user);
  const t = enAttente(id);
  const central = magasinService.central();
  const destination = magasinService.get(t.destination_id);
  const produit = produitService.get(t.produit_id);
  stockService.retirer(central, produit, t.quantite);
  stockService.ajouter(destination, produit, t.quantite);
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE transfert SET statut = 'VALIDE', traite_par_id = ?, date_traitement = ? WHERE id = ?"
  ).run(user.id, now, id);
  return toDto(db.prepare(TRANSFERT_QUERY + ' WHERE t.id = ?').get(id));
});

const refuser = db.transaction((user, id) => {
  acces.exigerUsine(user);
  enAttente(id);
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE transfert SET statut = 'REFUSE', traite_par_id = ?, date_traitement = ? WHERE id = ?"
  ).run(user.id, now, id);
  return toDto(db.prepare(TRANSFERT_QUERY + ' WHERE t.id = ?').get(id));
});

function enAttente(id) {
  const t = db.prepare(TRANSFERT_QUERY + ' WHERE t.id = ?').get(id);
  if (!t) throw new NotFoundError('Transfert', id);
  if (t.statut !== 'DEMANDE') throw new BusinessError('Ce transfert a déjà été traité');
  return t;
}

module.exports = { lister, demander, valider, refuser };
