const rateLimit = require('express-rate-limit');

const buildLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message },
  });

// Limite geral da API: 100 requisições / 15 min por IP.
const globalRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
});

// Limite mais rígido para login/cadastro (força bruta): 20 tentativas / 15 min por IP.
const authRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Muitas tentativas de autenticação. Aguarde 15 minutos e tente novamente.',
});

module.exports = { globalRateLimiter, authRateLimiter };
