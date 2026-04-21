import { adminRoute } from '@routes/admin.routes';
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

const homeRouteAdmin = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: lazyRouteComponent(() => import('@features/admin/pages/dashboard/Dashboard')),
});

export { homeRouteAdmin };
