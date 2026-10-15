const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// 404 para qualquer rota inexistente.
function notFoundHandler(req, res, next) {
  next(new AppError(`Rota ${req.method} ${req.originalUrl} não encontrada.`, 404));
}

// Formato padrão de erro: { status: 'error', message, errors? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Erro interno do servidor.';
  let errors;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Dados inválidos.';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON malformado no corpo da requisição.';
  } else if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido ou expirado.';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Registro duplicado.';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Registro não encontrado.';
    }
  }

  if (statusCode >= 500) {
    console.error(err);
    if (env.nodeEnv === 'production') message = 'Erro interno do servidor.';
  }

  const body = { status: 'error', message };
  if (errors) body.errors = errors;
  if (statusCode >= 500 && env.nodeEnv !== 'production') body.detail = err.message;

  return res.status(statusCode).json(body);
}

module.exports = { errorHandler, notFoundHandler };
