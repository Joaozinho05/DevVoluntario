const express = require('express');
const helmet = require('helmet');
const corsMiddleware = require('./middlewares/corsMiddleware');
const { globalRateLimiter } = require('./middlewares/rateLimitMiddleware');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Atrás do proxy do Render/Heroku/etc., o IP real vem em X-Forwarded-For (necessário para o rate limit).
app.set('trust proxy', 1);

app.use(helmet());
app.use(corsMiddleware);
app.use(globalRateLimiter);
app.use(express.json({ limit: '10kb' }));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
