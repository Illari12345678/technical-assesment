import { loadEnvConfig } from './config/env.config';
import { createApp } from './app';
import { createContainer } from './container';

const env = loadEnvConfig();
const container = createContainer(env);
const app = createApp(container);

app.listen(env.port, () => {
  container.logger.info(`Server listening on http://localhost:${env.port}/api`, {
    environment: env.environment,
    corsOrigins: env.corsOrigins,
  });
});
