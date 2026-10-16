const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { authRateLimiter } = require('../middlewares/rateLimitMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
