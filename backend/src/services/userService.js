const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');

const userService = {
  // Edição de currículo: GitHub, LinkedIn e resumo.
  async updateProfile(id, data) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    return userRepository.update(id, data);
  },
};

module.exports = userService;
