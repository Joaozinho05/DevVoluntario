const prisma = require('../lib/prisma');

// Campos seguros para devolver ao cliente (nunca inclui password).
const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  githubUrl: true,
  linkedinUrl: true,
  bio: true,
  createdAt: true,
};

const userRepository = {
  // Retorna o registro completo (com hash) - uso interno do login.
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id }, select: publicSelect });
  },

  create(data) {
    return prisma.user.create({ data, select: publicSelect });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data, select: publicSelect });
  },

  // Lista para o painel do ADMIN, com contagem de cargos e candidaturas de cada conta.
  list() {
    return prisma.user.findMany({
      select: { ...publicSelect, _count: { select: { jobs: true, applications: true } } },
      orderBy: { id: 'asc' },
    });
  },

  // Cargos e candidaturas do usuário saem junto (onDelete: Cascade no schema).
  delete(id) {
    return prisma.user.delete({ where: { id } });
  },
};

module.exports = userRepository;
