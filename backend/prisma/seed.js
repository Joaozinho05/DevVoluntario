require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Senhas simples SOMENTE para demonstração local (são mais curtas que a regra do cadastro público).
const USERS = [
  {
    name: 'Administrador',
    email: 'admin@devvoluntario.com',
    password: 'admin123',
    role: 'ADMIN',
    bio: 'Conta administrativa da plataforma.',
  },
  {
    name: 'Tech Para Todos',
    email: 'empresa@tech.com',
    password: 'empresa123',
    role: 'EMPRESA',
    bio: 'ONG que desenvolve soluções digitais para comunidades.',
  },
  {
    name: 'Ana Dev',
    email: 'trabalhador@dev.com',
    password: 'dev123',
    role: 'TRABALHADOR',
    githubUrl: 'https://github.com/ana-dev',
    linkedinUrl: 'https://linkedin.com/in/ana-dev',
    bio: 'Desenvolvedora full stack com foco em React e Node.js.',
  },
];

const INITIAL_JOB = {
  title: 'Desenvolvedor(a) React Júnior',
  description:
    'Ajude a construir o portal de doações da nossa ONG com React, Node.js e Prisma. ' +
    'Trabalho remoto, cerca de 4 horas por semana.',
  vacancies: 2,
};

async function main() {
  const created = {};

  for (const { password, ...data } of USERS) {
    const hash = await bcrypt.hash(password, 10);
    created[data.role] = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { ...data, password: hash },
    });
  }

  // Idempotente: só cria o cargo se a empresa ainda não tiver um com o mesmo título.
  const company = created.EMPRESA;
  const existingJob = await prisma.job.findFirst({
    where: { companyId: company.id, title: INITIAL_JOB.title },
  });
  if (!existingJob) {
    await prisma.job.create({
      data: { ...INITIAL_JOB, status: 'ABERTO', companyId: company.id },
    });
  }

  console.log('Seed concluído. Contas de demonstração:');
  USERS.forEach(({ role, email, password }) =>
    console.log(`  ${role.padEnd(12)} ${email} / ${password}`)
  );
  console.log(`Cargo inicial: "${INITIAL_JOB.title}" (${INITIAL_JOB.vacancies} vagas)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
