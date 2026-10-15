const applicationService = require('../services/applicationService');
const asyncHandler = require('../utils/asyncHandler');

const applicationController = {
  apply: asyncHandler(async (req, res) => {
    const result = await applicationService.apply({
      jobId: req.params.id,
      candidateId: req.user.id,
    });
    res.status(201).json({ message: 'Candidatura enviada com sucesso!', ...result });
  }),

  listMine: asyncHandler(async (req, res) => {
    const applications = await applicationService.listByCandidate(req.user.id);
    res.json({ applications });
  }),
};

module.exports = applicationController;
