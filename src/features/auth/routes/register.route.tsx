import { authRoute } from '@routes/auth.routes';
import { createRoute } from '@tanstack/react-router';
import { Register } from '../pages/Register';

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/register',
  component: Register,
});

export { registerRoute };
