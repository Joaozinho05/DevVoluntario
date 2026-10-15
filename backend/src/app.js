const express = require('express');
const helmet = require('helmet');
const corsMiddleware = require('./middlewares/corsMiddleware');
const { globalRateLimiter } = require('./middlewares/rateLimitMiddleware');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(globalRateLimiter);
app.use(express.json({ limit: '10kb' }));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
