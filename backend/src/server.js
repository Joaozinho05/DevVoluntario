const env = require('./config/env');
const app = require('./app');
const prisma = require('./lib/prisma');

const server = app.listen(env.port, () => {
  console.log(`API DevVoluntário rodando em http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
