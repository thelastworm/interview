const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM magasin').get().c;
  if (count > 0) return;

  // --- Magasins ---
  const insertMagasin = db.prepare('INSERT INTO magasin (nom, ville, type) VALUES (?, ?, ?)');
  const cId = insertMagasin.run('Magasin Central - Usine', 'Lyon', 'CENTRAL').lastInsertRowid;
  const pId = insertMagasin.run('Magasin Paris', 'Paris', 'BOUTIQUE').lastInsertRowid;
  const mId = insertMagasin.run('Magasin Marseille', 'Marseille', 'BOUTIQUE').lastInsertRowid;
  const bId = insertMagasin.run('Magasin Bordeaux', 'Bordeaux', 'BOUTIQUE').lastInsertRowid;

  // --- Utilisateurs ---
  const pwd = bcrypt.hashSync('password', 10);
  const insertUser = db.prepare(
    'INSERT INTO utilisateur (username, password, nom_complet, role, magasin_id) VALUES (?, ?, ?, ?, ?)'
  );
  insertUser.run('admin',          pwd, 'Alice Directrice',  'ADMIN',       null);
  insertUser.run('resp.central',   pwd, 'Claude Martin',     'RESPONSABLE', cId);
  insertUser.run('vend.central',   pwd, 'Camille Petit',     'VENDEUR',     cId);
  insertUser.run('resp.paris',     pwd, 'Paul Durand',       'RESPONSABLE', pId);
  insertUser.run('vend.paris1',    pwd, 'Pauline Moreau',    'VENDEUR',     pId);
  insertUser.run('vend.paris2',    pwd, 'Pierre Lefebvre',   'VENDEUR',     pId);
  insertUser.run('resp.marseille', pwd, 'Marc Roux',         'RESPONSABLE', mId);
  insertUser.run('vend.marseille', pwd, 'Marie Fournier',    'VENDEUR',     mId);
  insertUser.run('resp.bordeaux',  pwd, 'Bruno Girard',      'RESPONSABLE', bId);
  insertUser.run('vend.bordeaux',  pwd, 'Béatrice Bonnet',   'VENDEUR',     bId);

  // --- Fournisseurs ---
  const insertFourn = db.prepare('INSERT INTO fournisseur (nom, email, telephone) VALUES (?, ?, ?)');
  const cadrePro    = insertFourn.run('CadrePro',     'contact@cadrepro.fr',      '04 72 00 00 01').lastInsertRowid;
  const roueExpress = insertFourn.run('RoueExpress',  'ventes@roueexpress.fr',    '01 45 00 00 02').lastInsertRowid;
  const shimaTech   = insertFourn.run('ShimaTech',    'pro@shimatech.com',         '03 20 00 00 03').lastInsertRowid;

  // --- Pièces détachées ---
  const ip = db.prepare('INSERT INTO produit (reference, nom, type, prix_vente, fournisseur_id) VALUES (?, ?, ?, ?, ?)');
  const cadreVille   = ip.run('P-CAD-VIL', 'Cadre ville aluminium',     'PIECE', 120.00, cadrePro).lastInsertRowid;
  const cadreVtt     = ip.run('P-CAD-VTT', 'Cadre VTT carbone',         'PIECE', 350.00, cadrePro).lastInsertRowid;
  const roue28       = ip.run('P-ROU-28',  'Roue 28 pouces',             'PIECE',  45.00, roueExpress).lastInsertRowid;
  const roue29       = ip.run('P-ROU-29',  'Roue VTT 29 pouces',         'PIECE',  70.00, roueExpress).lastInsertRowid;
  const pneu         = ip.run('P-PNE-01',  'Pneu',                       'PIECE',  18.00, roueExpress).lastInsertRowid;
  const freins       = ip.run('P-FRE-01',  'Kit freins à disque',         'PIECE',  60.00, shimaTech).lastInsertRowid;
  const transmission = ip.run('P-TRA-01',  'Transmission 9 vitesses',    'PIECE',  85.00, shimaTech).lastInsertRowid;
  const selle        = ip.run('P-SEL-01',  'Selle confort',               'PIECE',  25.00, cadrePro).lastInsertRowid;
  const guidon       = ip.run('P-GUI-01',  'Guidon',                      'PIECE',  22.00, cadrePro).lastInsertRowid;

  // --- Vélos ---
  const veloVille = ip.run('V-VILLE', 'Vélo de ville', 'VELO', 549.00,  null).lastInsertRowid;
  const vtt       = ip.run('V-VTT',   'VTT carbone',   'VELO', 1290.00, null).lastInsertRowid;

  // --- Nomenclatures ---
  const ic = db.prepare('INSERT INTO composant (velo_id, piece_id, quantite) VALUES (?, ?, ?)');
  ic.run(veloVille, cadreVille,   1);
  ic.run(veloVille, roue28,       2);
  ic.run(veloVille, pneu,         2);
  ic.run(veloVille, freins,       1);
  ic.run(veloVille, transmission, 1);
  ic.run(veloVille, selle,        1);
  ic.run(veloVille, guidon,       1);

  ic.run(vtt, cadreVtt,     1);
  ic.run(vtt, roue29,       2);
  ic.run(vtt, pneu,         2);
  ic.run(vtt, freins,       1);
  ic.run(vtt, transmission, 1);
  ic.run(vtt, selle,        1);
  ic.run(vtt, guidon,       1);

  // --- Stocks ---
  const is = db.prepare('INSERT INTO stock (magasin_id, produit_id, quantite, seuil_alerte) VALUES (?, ?, ?, ?)');

  for (const pid of [cadreVille, cadreVtt, guidon, selle, freins, transmission]) {
    is.run(cId, pid, 20, 5);
  }
  is.run(cId, roue28,    40, 10);
  is.run(cId, roue29,    40, 10);
  is.run(cId, pneu,      80, 20);
  is.run(cId, veloVille, 10,  3);
  is.run(cId, vtt,        5,  2);

  for (const magId of [pId, mId, bId]) {
    is.run(magId, veloVille, 4, 2);
    is.run(magId, vtt,       2, 1);
    is.run(magId, pneu,     10, 3);
    is.run(magId, selle,     5, 2);
  }
}

module.exports = seed;
