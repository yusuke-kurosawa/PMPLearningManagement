import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server
export const server = setupServer(...handlers);

// Server lifecycle methods
export const startServer = () => {
  server.listen({ onUnhandledRequest: 'error' });
};

export const stopServer = () => {
  server.close();
};

export const resetServer = () => {
  server.resetHandlers();
};