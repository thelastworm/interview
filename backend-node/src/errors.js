class BusinessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessError';
    this.status = 400;
  }
}

class NotFoundError extends Error {
  constructor(entity, id) {
    super(`${entity} introuvable : ${id}`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class AccessDeniedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccessDeniedError';
    this.status = 403;
  }
}

class AuthError extends Error {
  constructor(message = 'Identifiants invalides') {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
  }
}

module.exports = { BusinessError, NotFoundError, AccessDeniedError, AuthError };
