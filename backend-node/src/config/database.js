const Database = require('better-sqlite3');

const db = new Database(':memory:');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS magasin (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nom      TEXT NOT NULL UNIQUE,
    ville    TEXT,
    type     TEXT NOT NULL CHECK(type IN ('CENTRAL', 'BOUTIQUE'))
  );

  CREATE TABLE IF NOT EXISTS fournisseur (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT NOT NULL,
    email      TEXT,
    telephone  TEXT
  );

  CREATE TABLE IF NOT EXISTS produit (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    reference     TEXT NOT NULL UNIQUE,
    nom           TEXT NOT NULL,
    type          TEXT NOT NULL CHECK(type IN ('VELO', 'PIECE')),
    prix_vente    REAL NOT NULL,
    fournisseur_id INTEGER REFERENCES fournisseur(id)
  );

  CREATE TABLE IF NOT EXISTS composant (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    velo_id   INTEGER NOT NULL REFERENCES produit(id),
    piece_id  INTEGER NOT NULL REFERENCES produit(id),
    quantite  INTEGER NOT NULL,
    UNIQUE(velo_id, piece_id)
  );

  CREATE TABLE IF NOT EXISTS utilisateur (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    nom_complet TEXT NOT NULL,
    role        TEXT NOT NULL CHECK(role IN ('ADMIN', 'RESPONSABLE', 'VENDEUR')),
    magasin_id  INTEGER REFERENCES magasin(id),
    actif       INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS stock (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    magasin_id   INTEGER NOT NULL REFERENCES magasin(id),
    produit_id   INTEGER NOT NULL REFERENCES produit(id),
    quantite     INTEGER NOT NULL DEFAULT 0,
    seuil_alerte INTEGER NOT NULL DEFAULT 0,
    version      INTEGER NOT NULL DEFAULT 0,
    UNIQUE(magasin_id, produit_id)
  );

  CREATE TABLE IF NOT EXISTS commande_fournisseur (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    fournisseur_id INTEGER NOT NULL REFERENCES fournisseur(id),
    statut         TEXT NOT NULL DEFAULT 'EN_COURS' CHECK(statut IN ('EN_COURS', 'RECUE', 'ANNULEE')),
    date_commande  TEXT NOT NULL DEFAULT (datetime('now')),
    date_reception TEXT,
    commandeur_id  INTEGER NOT NULL REFERENCES utilisateur(id)
  );

  CREATE TABLE IF NOT EXISTS ligne_commande (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    commande_id  INTEGER NOT NULL REFERENCES commande_fournisseur(id),
    piece_id     INTEGER NOT NULL REFERENCES produit(id),
    quantite     INTEGER NOT NULL,
    prix_unitaire REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS assemblage (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    velo_id      INTEGER NOT NULL REFERENCES produit(id),
    quantite     INTEGER NOT NULL,
    date         TEXT NOT NULL DEFAULT (datetime('now')),
    operateur_id INTEGER NOT NULL REFERENCES utilisateur(id)
  );

  CREATE TABLE IF NOT EXISTS transfert (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_id   INTEGER NOT NULL REFERENCES magasin(id),
    produit_id       INTEGER NOT NULL REFERENCES produit(id),
    quantite         INTEGER NOT NULL,
    statut           TEXT NOT NULL DEFAULT 'DEMANDE' CHECK(statut IN ('DEMANDE', 'VALIDE', 'REFUSE')),
    demandeur_id     INTEGER NOT NULL REFERENCES utilisateur(id),
    traite_par_id    INTEGER REFERENCES utilisateur(id),
    date_demande     TEXT NOT NULL DEFAULT (datetime('now')),
    date_traitement  TEXT,
    commentaire      TEXT
  );

  CREATE TABLE IF NOT EXISTS vente (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    magasin_id  INTEGER NOT NULL REFERENCES magasin(id),
    vendeur_id  INTEGER NOT NULL REFERENCES utilisateur(id),
    client      TEXT,
    date        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ligne_vente (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    vente_id      INTEGER NOT NULL REFERENCES vente(id),
    produit_id    INTEGER NOT NULL REFERENCES produit(id),
    quantite      INTEGER NOT NULL,
    prix_unitaire REAL NOT NULL
  );
`);

module.exports = db;
