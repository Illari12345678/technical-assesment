import express, { Express } from 'express';
import cors from 'cors';
import { AppContainer } from './container';
import { errorHandler } from './infrastructure/http/middlewares/error-handler.middleware';

/**
 * Montaje de la aplicación HTTP. Separado de main.ts para poder testear
 * la API con supertest sin arrancar el servidor.
 */
export const createApp = (container: AppContainer): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(cors({ origin: container.env.corsOrigins }));

  app.use('/api', container.policyRoutes);

  app.use(errorHandler(container.logger));

  return app;
};
