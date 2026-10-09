const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errors');

const authRoutes        = require('./routes/auth');
const magasinRoutes     = require('./routes/magasins');
const catalogueRoutes   = require('./routes/catalogue');
const usineRoutes       = require('./routes/usine');
const transfertRoutes   = require('./routes/transferts');
const venteRoutes       = require('./routes/ventes');
const utilisateurRoutes = require('./routes/utilisateurs');

const app = express();

const allowedOrigins = (process.env.APP_CORS_ALLOWED_ORIGINS || 'http://localhost:4200').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api',              magasinRoutes);
app.use('/api',              catalogueRoutes);
app.use('/api',              usineRoutes);
app.use('/api/transferts',   transfertRoutes);
app.use('/api/ventes',       venteRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

app.use(errorHandler);

module.exports = app;
