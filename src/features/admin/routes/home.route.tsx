import Home from '@features/admin/pages/Home';
import { adminRoute } from '@routes/admin.routes';
import { createRoute } from '@tanstack/react-router';

const homeRouteAdmin = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: Home,
});

export { homeRouteAdmin };
