/**
 * Driver Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Driver list route - using enhanced page with salary tracking
export const driverListRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/drivers',
  component: lazyRouteComponent(() => import('@features/admin/pages/drivers/DriverListEnhanced')),
});

// Driver detail route
export const driverDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/drivers/$maTaiXe',
  component: lazyRouteComponent(() => import('@features/admin/pages/drivers/DriverDetail')),
});

// Driver edit route
export const driverEditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/drivers/$maTaiXe/edit',
  component: lazyRouteComponent(() => import('@features/admin/pages/drivers/DriverForm')),
});

// Driver create route
export const driverCreateRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/drivers/new',
  component: lazyRouteComponent(() => import('@features/admin/pages/drivers/DriverForm')),
});

// Export all driver routes
export const driverRoutes = [
  driverListRoute,
  driverCreateRoute,
  driverDetailRoute,
  driverEditRoute,
];
