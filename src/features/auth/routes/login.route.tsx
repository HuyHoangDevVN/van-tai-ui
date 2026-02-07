import { authRoute } from '@routes/auth.routes';
import { createRoute } from '@tanstack/react-router';
import { Login } from '../pages/Login';

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: Login,
});

export { loginRoute };
