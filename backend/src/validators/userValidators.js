const { z } = require('zod');
const { isUrlFromDomain } = require('./common');

const emptyToNull = (value) => (value === '' ? null : value);

// String vazia limpa o campo (null); ausente mantém o valor atual (undefined).
const profileUrl = (domain, label) =>
  z
    .string()
    .trim()
    .max(200, 'URL muito longa')
    .refine((value) => value === '' || isUrlFromDomain(value, domain), {
      message: `Informe uma URL válida do ${label} (ex.: https://${domain}/seu-perfil)`,
    })
    .transform(emptyToNull)
    .optional();

// Apenas campos de currículo: role, e-mail e senha não podem ser alterados por aqui.
const updateProfileSchema = z.object({
  githubUrl: profileUrl('github.com', 'GitHub'),
  linkedinUrl: profileUrl('linkedin.com', 'LinkedIn'),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio deve ter no máximo 500 caracteres')
    .transform(emptyToNull)
    .optional(),
});

module.exports = { updateProfileSchema };
