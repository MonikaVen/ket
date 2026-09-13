import { createApiRouter } from './api.mjs';

export function ketApiPlugin() {
  return {
    name: 'ket-api',
    configureServer(server) {
      server.middlewares.use('/api', createApiRouter());
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', createApiRouter());
    },
  };
}
