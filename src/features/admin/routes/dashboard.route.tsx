import { adminRoute } from '@routes/admin.routes';
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

const dashboardRouteAdmin = createRoute({
  getParentRoute: () => adminRoute,
  path: '/dashboard',
  component: lazyRouteComponent(() => import('@features/admin/pages/dashboard/Dashboard')),
});

export { dashboardRouteAdmin };
