const venteService = require('./venteService');
const stockService = require('./stockService');
const transfertService = require('./transfertService');

function calculer(user) {
  const ventes = venteService.lister(user);
  const stocks = stockService.lister(user, null);
  const transferts = transfertService.lister(user);

  const chiffreAffaires = ventes.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalStock = stocks.reduce((sum, s) => sum + s.quantite, 0);
  const stocksBas = stocks.filter(s => s.stockBas).length;
  const transfertsEnAttente = transferts.filter(t => t.statut === 'DEMANDE').length;

  return {
    nombreVentes: ventes.length,
    chiffreAffaires,
    totalStock,
    stocksBas,
    transfertsEnAttente,
  };
}

module.exports = { calculer };
