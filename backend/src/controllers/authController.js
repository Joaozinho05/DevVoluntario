const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ user });
  }),
};

module.exports = authController;
