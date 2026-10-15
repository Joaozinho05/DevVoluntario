const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');

const adminController = {
  listUsers: asyncHandler(async (req, res) => {
    const users = await adminService.listUsers();
    res.json({ users });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    await adminService.deleteUser({ adminId: req.user.id, userId: req.params.id });
    res.status(204).send();
  }),

  deleteJob: asyncHandler(async (req, res) => {
    await adminService.deleteJob(req.params.id);
    res.status(204).send();
  }),
};

module.exports = adminController;
