const prisma = require('../lib/prisma');
const { JOB_STATUS } = require('../config/roles');

// Em PostgreSQL a busca precisa de mode: 'insensitive'; no SQLite o LIKE já ignora maiúsculas.
const isPostgres = (process.env.DATABASE_URL || '').startsWith('postgres');
const caseInsensitive = isPostgres ? { mode: 'insensitive' } : {};

// Inclui a empresa e a contagem de candidaturas (usada na barra de progresso das vagas).
const jobInclude = {
  company: { select: { id: true, name: true } },
  _count: { select: { applications: true } },
};

const jobRepository = {
  create(data, db = prisma) {
    return db.job.create({ data, include: jobInclude });
  },

  // Filtro por título OU descrição (onde ficam as tecnologias) e, opcionalmente, por status.
  findMany({ search, status } = {}) {
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, ...caseInsensitive } },
        { description: { contains: search, ...caseInsensitive } },
      ];
    }
    return prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  // Cargos de uma empresa, já com os candidatos inscritos em cada um.
  findByCompany(companyId) {
    return prisma.job.findMany({
      where: { companyId },
      include: {
        ...jobInclude,
        applications: {
          orderBy: { createdAt: 'asc' },
          include: {
            candidate: {
              select: { id: true, name: true, email: true, githubUrl: true, linkedinUrl: true, bio: true },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  findById(id, db = prisma) {
    return db.job.findUnique({ where: { id } });
  },

  // Trava o cargo para a transação atual: o UPDATE "vazio" adquire o lock de escrita
  // (linha no PostgreSQL, banco inteiro no SQLite), então duas candidaturas simultâneas
  // nunca passam juntas pela contagem. Retorna false se o cargo não existe ou já está ENCERRADO.
  async lockIfOpen(id, db = prisma) {
    const { count } = await db.job.updateMany({
      where: { id, status: JOB_STATUS.ABERTO },
      data: { status: JOB_STATUS.ABERTO },
    });
    return count > 0;
  },

  updateStatus(id, status, db = prisma) {
    return db.job.update({ where: { id }, data: { status } });
  },

  // Candidaturas do cargo saem junto (onDelete: Cascade no schema).
  delete(id) {
    return prisma.job.delete({ where: { id } });
  },
};

module.exports = jobRepository;
