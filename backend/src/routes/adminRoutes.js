const { Router } = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const validate = require('../middlewares/validate');
const { ROLES } = require('../config/roles');
const { idParamSchema } = require('../validators/common');

const router = Router();

// Tudo em /admin exige token válido E perfil ADMIN.
router.use(authMiddleware, rbacMiddleware(ROLES.ADMIN));

router.get('/users', adminController.listUsers);
router.delete('/users/:id', validate(idParamSchema, 'params'), adminController.deleteUser);
router.delete('/jobs/:id', validate(idParamSchema, 'params'), adminController.deleteJob);

module.exports = router;
