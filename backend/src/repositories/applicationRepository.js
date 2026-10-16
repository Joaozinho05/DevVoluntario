const prisma = require('../lib/prisma');

const applicationRepository = {
  // Executa `fn(tx)` em uma transação interativa: ou tudo é gravado, ou nada.
  transaction(fn) {
    return prisma.$transaction(fn, { timeout: 10000 });
  },

  countByJob(jobId, db = prisma) {
    return db.application.count({ where: { jobId } });
  },

  // Sem checagem de duplicidade de propósito: o mesmo candidato pode se candidatar
  // várias vezes ao mesmo cargo (regra de demonstração).
  create({ jobId, candidateId }, db = prisma) {
    return db.application.create({ data: { jobId, candidateId } });
  },

  findByCandidate(candidateId) {
    return prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            vacancies: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },
};

module.exports = applicationRepository;
