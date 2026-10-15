const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');
const jobRepository = require('../repositories/jobRepository');

const adminService = {
  listUsers() {
    return userRepository.list();
  },

  async deleteUser({ adminId, userId }) {
    if (adminId === userId) {
      throw new AppError('Você não pode excluir a própria conta.', 400);
    }
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    await userRepository.delete(userId);
  },

  async deleteJob(jobId) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw new AppError('Cargo não encontrado.', 404);
    await jobRepository.delete(jobId);
  },
};

module.exports = adminService;
