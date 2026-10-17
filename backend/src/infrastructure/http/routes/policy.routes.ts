import { Router } from 'express';
import { PolicyController } from '../controllers/policy.controller';

export const createPolicyRoutes = (controller: PolicyController): Router => {
  const router = Router();

  router.get('/policies', controller.getAll);
  router.get('/policies/:id', controller.getById);
  router.post('/policies', controller.create);
  router.put('/policies/:id', controller.update);

  return router;
};
