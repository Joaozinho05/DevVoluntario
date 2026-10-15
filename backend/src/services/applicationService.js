const AppError = require('../utils/AppError');
const { JOB_STATUS } = require('../config/roles');
const jobRepository = require('../repositories/jobRepository');
const applicationRepository = require('../repositories/applicationRepository');

const LIMIT_REACHED_MESSAGE = 'Limite de vagas atingido! Candidaturas encerradas.';

const applicationService = {
  // REGRA CRÍTICA DO LIMITE DE VAGAS
  // Tudo acontece em UMA transação: travar o cargo -> contar candidaturas -> decidir -> gravar.
  //   - cargo ENCERRADO                    -> 400 "Limite de vagas atingido! Candidaturas encerradas."
  //   - total de candidaturas < vacancies  -> cria a candidatura
  //   - ao criar, se total == vacancies    -> o cargo vira ENCERRADO automaticamente (ex.: 2/2)
  // Não existe checagem de duplicidade: o mesmo candidato pode se candidatar mais de uma vez.
  async apply({ jobId, candidateId }) {
    const outcome = await applicationRepository.transaction(async (tx) => {
      const isOpen = await jobRepository.lockIfOpen(jobId, tx);

      if (!isOpen) {
        const job = await jobRepository.findById(jobId, tx);
        return { type: job ? 'CLOSED' : 'NOT_FOUND' };
      }

      const job = await jobRepository.findById(jobId, tx);
      const totalBefore = await applicationRepository.countByJob(jobId, tx);

      // Cargo marcado como ABERTO, mas já lotado (ex.: dados inconsistentes): corrige e bloqueia.
      if (totalBefore >= job.vacancies) {
        await jobRepository.updateStatus(jobId, JOB_STATUS.ENCERRADO, tx);
        return { type: 'CLOSED' };
      }

      const application = await applicationRepository.create({ jobId, candidateId }, tx);
      const applicationsCount = totalBefore + 1;

      let status = JOB_STATUS.ABERTO;
      if (applicationsCount >= job.vacancies) {
        status = JOB_STATUS.ENCERRADO;
        await jobRepository.updateStatus(jobId, status, tx);
      }

      return {
        type: 'CREATED',
        application,
        job: { id: job.id, title: job.title, vacancies: job.vacancies, applicationsCount, status },
      };
    });

    if (outcome.type === 'NOT_FOUND') throw new AppError('Cargo não encontrado.', 404);
    if (outcome.type === 'CLOSED') throw new AppError(LIMIT_REACHED_MESSAGE, 400);

    return { application: outcome.application, job: outcome.job };
  },

  listByCandidate(candidateId) {
    return applicationRepository.findByCandidate(candidateId);
  },
};

module.exports = applicationService;
