/**
 * Vehicle Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Vehicle list route
export const vehicleListRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/vehicles',
  component: lazyRouteComponent(() => import('@features/admin/pages/vehicles/VehicleList')),
});

// Export all vehicle routes
export const vehicleRoutes = [vehicleListRoute];
