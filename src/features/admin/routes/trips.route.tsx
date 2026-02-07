/**
 * Trip Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Trip list route
export const tripListRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/trips',
  component: lazyRouteComponent(() => import('@features/admin/pages/trips/TripList')),
});

// Export all trip routes
export const tripRoutes = [tripListRoute];
