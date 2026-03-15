import AdminLayout from '@components/layout/admin/AdminLayout';
import { dashboardRouteAdmin } from '@features/admin/routes/dashboard.route';
import { homeRouteAdmin } from '@features/admin/routes/home.route';
import { settingRouteAdmin } from '@features/admin/routes/setting.route';
import { userRouteAdmin } from '@features/admin/routes/users.route';
import { generalCategoryTree } from '@features/admin/routes/generalCategory.routes';
import { driverRoutes } from '@features/admin/routes/drivers.route';
import { vehicleRoutes } from '@features/admin/routes/vehicles.route';
import { tripRoutes } from '@features/admin/routes/trips.route';
import { reportRoutes } from '@features/admin/routes/reports.route';
import { ticketRoutes } from '@features/admin/routes/tickets.route';
import { routeRoutes } from '@features/admin/routes/routes.route';
import { maintenanceRoutes } from '@features/admin/routes/maintenance.route';
import { createRoute } from '@tanstack/react-router';
import { rootRoutes } from './routes';

const adminRoute = createRoute({
  getParentRoute: () => rootRoutes,
  path: '/admin',
  component: AdminLayout,
});

const adminTree = adminRoute.addChildren([
  homeRouteAdmin,
  dashboardRouteAdmin,
  userRouteAdmin,
  settingRouteAdmin,
  generalCategoryTree,
  ...driverRoutes,
  ...vehicleRoutes,
  ...tripRoutes,
  ...reportRoutes,
  ...ticketRoutes,
  ...routeRoutes,
  ...maintenanceRoutes,
]);

export { adminRoute, adminTree };
