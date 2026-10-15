const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');

// Hash descartável usado para manter o tempo de resposta parecido
// quando o e-mail não existe (dificulta enumeração de usuários).
const DUMMY_HASH = bcrypt.hashSync('senha-descartavel', env.bcryptSaltRounds);

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

const authService = {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Já existe uma conta com este e-mail.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, env.bcryptSaltRounds);
    const user = await userRepository.create({ ...data, password: passwordHash });

    return { user, token: signToken(user) };
  },

  async login({ email, password }) {
    const found = await userRepository.findByEmail(email);
    const passwordMatches = await bcrypt.compare(password, found ? found.password : DUMMY_HASH);

    if (!found || !passwordMatches) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    // eslint-disable-next-line no-unused-vars
    const { password: _hash, ...user } = found;
    return { user, token: signToken(user) };
  },

  async getProfile(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    return user;
  },
};

module.exports = authService;
