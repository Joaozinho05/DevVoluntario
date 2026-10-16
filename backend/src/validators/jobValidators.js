const { z } = require('zod');
const { JOB_STATUS } = require('../config/roles');

const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .trim()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(120, 'Título deve ter no máximo 120 caracteres'),
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .trim()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  vacancies: z.coerce
    .number({ invalid_type_error: 'Informe o número de vagas' })
    .int('Número de vagas deve ser um número inteiro')
    .min(1, 'O cargo precisa ter pelo menos 1 vaga')
    .max(100, 'O máximo é de 100 vagas por cargo'),
});

// Filtros do GET /jobs: ?search=react&status=ABERTO
const listJobsQuerySchema = z.object({
  search: z.string().trim().max(100, 'Busca muito longa').optional(),
  status: z
    .enum([JOB_STATUS.ABERTO, JOB_STATUS.ENCERRADO], {
      errorMap: () => ({ message: 'Status deve ser ABERTO ou ENCERRADO' }),
    })
    .optional(),
});

module.exports = { createJobSchema, listJobsQuerySchema };
