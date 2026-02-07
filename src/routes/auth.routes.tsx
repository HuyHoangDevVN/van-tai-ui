import { createRoute } from '@tanstack/react-router';
import { rootRoutes } from './routes';
import { AuthLayout } from '@components/layout/auth/AuthLayout';
import { loginRoute } from '@features/auth/routes/login.route';
import { registerRoute } from '@features/auth/routes/register.route';

const authRoute = createRoute({
  getParentRoute: () => rootRoutes,
  path: '/auth',
  component: AuthLayout,
});

const authTree = authRoute.addChildren([loginRoute, registerRoute]);

export { authTree, authRoute };
