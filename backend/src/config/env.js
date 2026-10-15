require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '8h',
  bcryptSaltRounds: 10,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

if (!env.jwtSecret) {
  throw new Error('Variável de ambiente JWT_SECRET não definida. Copie .env.example para .env.');
}

module.exports = env;
