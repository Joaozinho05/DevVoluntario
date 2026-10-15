const jobService = require('../services/jobService');
const asyncHandler = require('../utils/asyncHandler');

const jobController = {
  create: asyncHandler(async (req, res) => {
    const job = await jobService.create(req.user.id, req.body);
    res.status(201).json({ job });
  }),

  list: asyncHandler(async (req, res) => {
    const jobs = await jobService.list(req.query);
    res.json({ jobs });
  }),

  listMine: asyncHandler(async (req, res) => {
    const jobs = await jobService.listByCompany(req.user.id);
    res.json({ jobs });
  }),
};

module.exports = jobController;
