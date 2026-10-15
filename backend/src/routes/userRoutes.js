const { Router } = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../validators/userValidators');

const router = Router();

// Edição rápida do próprio perfil/currículo (qualquer usuário autenticado).
router.patch('/me', authMiddleware, validate(updateProfileSchema), userController.updateMe);

module.exports = router;
