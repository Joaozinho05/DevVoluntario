const cors = require('cors');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const corsMiddleware = cors({
  origin(origin, callback) {
    // Sem header Origin (curl, Postman, servidor-servidor) é permitido.
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError('Origem não permitida pelo CORS.', 403));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
});

module.exports = corsMiddleware;
