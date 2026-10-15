const { Router } = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const { ROLES } = require('../config/roles');

const router = Router();

// Histórico de candidaturas do trabalhador logado.
router.get('/mine', authMiddleware, rbacMiddleware(ROLES.TRABALHADOR), applicationController.listMine);

module.exports = router;
