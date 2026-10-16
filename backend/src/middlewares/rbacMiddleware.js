const AppError = require('../utils/AppError');

// Uso: router.get('/x', authMiddleware, rbacMiddleware('ADMIN', 'EMPRESA'), handler)
// Deve vir SEMPRE depois do authMiddleware.
function rbacMiddleware(...allowedRoles) {
  const allowed = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticação necessária.', 401));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
    }
    return next();
  };
}

module.exports = rbacMiddleware;
