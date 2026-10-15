const { Router } = require('express');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const validate = require('../middlewares/validate');
const { ROLES } = require('../config/roles');
const { idParamSchema } = require('../validators/common');
const { createJobSchema, listJobsQuerySchema } = require('../validators/jobValidators');

const router = Router();

// Listagem pública, com filtros ?search= e ?status=
router.get('/', validate(listJobsQuerySchema, 'query'), jobController.list);

// Cargos da empresa logada (com candidatos). Declarada antes de qualquer rota /:id.
router.get('/mine', authMiddleware, rbacMiddleware(ROLES.EMPRESA), jobController.listMine);

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(ROLES.EMPRESA),
  validate(createJobSchema),
  jobController.create
);

// Candidatura (regra do limite de vagas em applicationService)
router.post(
  '/:id/apply',
  authMiddleware,
  rbacMiddleware(ROLES.TRABALHADOR),
  validate(idParamSchema, 'params'),
  applicationController.apply
);

module.exports = router;
