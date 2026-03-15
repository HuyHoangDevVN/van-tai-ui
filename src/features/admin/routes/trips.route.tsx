/**
 * Trip Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Trip list route - using enhanced page with driver assignment
export const tripListRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/trips',
  component: lazyRouteComponent(() => import('@features/admin/pages/trips/TripListEnhanced')),
});

// Export all trip routes
export const tripRoutes = [tripListRoute];
