const { AccessDeniedError } = require('../errors');

function exigerUsine(user) {
  if (!user.peutGererUsine()) {
    throw new AccessDeniedError(
      "Réservé à la direction et au responsable du magasin central (usine)"
    );
  }
}

function exigerAdmin(user) {
  if (!user.isAdmin()) {
    throw new AccessDeniedError("Réservé à la direction");
  }
}

function exigerLectureMagasin(user, magasinId) {
  if (!user.peutGererUsine() && magasinId !== user.magasinId) {
    throw new AccessDeniedError("Accès limité à votre magasin");
  }
}

module.exports = { exigerUsine, exigerAdmin, exigerLectureMagasin };
