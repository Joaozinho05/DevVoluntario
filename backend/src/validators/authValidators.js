const { z } = require('zod');
const { REGISTERABLE_ROLES } = require('../config/roles');
const { isUrlFromDomain } = require('./common');

// Campo opcional de URL: aceita vazio/ausente e exige o domínio esperado quando preenchido.
const optionalProfileUrl = (domain, label) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine(
      (value) => !value || isUrlFromDomain(value, domain),
      { message: `Informe uma URL válida do ${label} (ex.: https://${domain}/seu-perfil)` }
    );

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('E-mail inválido'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres')
    .regex(/[A-Za-z]/, 'Senha deve conter ao menos uma letra')
    .regex(/\d/, 'Senha deve conter ao menos um número'),
  role: z.enum(REGISTERABLE_ROLES, {
    errorMap: () => ({ message: 'Perfil deve ser EMPRESA ou TRABALHADOR' }),
  }),
  githubUrl: optionalProfileUrl('github.com', 'GitHub'),
  linkedinUrl: optionalProfileUrl('linkedin.com', 'LinkedIn'),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio deve ter no máximo 500 caracteres')
    .optional()
    .transform((value) => value || undefined),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('E-mail inválido'),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

module.exports = { registerSchema, loginSchema };
