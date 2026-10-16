const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const userController = {
  updateMe: asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ user });
  }),
};

module.exports = userController;
