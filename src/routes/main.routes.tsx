import { createRoute } from '@tanstack/react-router';
import { rootRoutes } from './routes';
import MainLayout from '@components/layout/main/MainLayout';
import homeRoute from '@features/home/routes/home.route';

const mainRoute = createRoute({
  getParentRoute: () => rootRoutes,
  id: 'main',
  component: MainLayout,
});

const mainTree = mainRoute.addChildren([homeRoute]);

export { mainTree, mainRoute };
