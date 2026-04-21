/**
 * Routes Management Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Route list route
export const routeListRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/routes',
  component: lazyRouteComponent(() => import('@features/admin/pages/routes/RouteList')),
});

// Route create route
export const routeCreateRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/routes/create',
  component: lazyRouteComponent(
    () => import('@features/admin/pages/routes/RouteForm'),
    'RouteCreatePage',
  ),
});

// Route edit route
export const routeEditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/routes/$maTuyen/edit',
  component: lazyRouteComponent(
    () => import('@features/admin/pages/routes/RouteForm'),
    'RouteEditPage',
  ),
});

// Export all route routes
export const routeRoutes = [routeListRoute, routeCreateRoute, routeEditRoute];
