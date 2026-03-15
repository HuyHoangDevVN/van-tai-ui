/**
 * Report Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Reports route - using enhanced page with salary, revenue reports
export const reportsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/reports',
  component: lazyRouteComponent(() => import('@features/admin/pages/reports/ReportsEnhanced')),
});

// Export all report routes
export const reportRoutes = [reportsRoute];
