import { apiMiddleware } from './api.mjs';

export function ketApiPlugin() {
  return {
    name: 'ket-api',
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}
