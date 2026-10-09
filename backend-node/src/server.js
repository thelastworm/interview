require('./config/database'); // initialise le schéma SQLite en mémoire
const seed = require('./config/seed');
const app = require('./app');

seed();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`VéloGestion backend Node.js démarré sur http://localhost:${PORT}`);
  console.log('Base de données SQLite en mémoire initialisée (données réinitialisées à chaque démarrage).');
});
