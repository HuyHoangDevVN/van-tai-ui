/**
 * Maintenance Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Maintenance list route
export const maintenanceListRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/maintenance',
  component: lazyRouteComponent(() => import('@features/admin/pages/maintenance/MaintenanceList')),
});

// Export all maintenance routes
export const maintenanceRoutes = [maintenanceListRoute];
