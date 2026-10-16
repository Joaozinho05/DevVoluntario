const jobRepository = require('../repositories/jobRepository');

// Troca o _count do Prisma por um campo simples: applicationsCount.
function toJobDto({ _count, ...job }) {
  return { ...job, applicationsCount: _count ? _count.applications : (job.applications?.length ?? 0) };
}

const jobService = {
  async create(companyId, data) {
    const job = await jobRepository.create({ ...data, companyId });
    return toJobDto(job);
  },

  async list(filters) {
    const jobs = await jobRepository.findMany(filters);
    return jobs.map(toJobDto);
  },

  async listByCompany(companyId) {
    const jobs = await jobRepository.findByCompany(companyId);
    return jobs.map(toJobDto);
  },
};

module.exports = jobService;
