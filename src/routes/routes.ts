import { createRootRoute, createRouter } from '@tanstack/react-router';
import { mainTree } from './main.routes';
import { adminTree } from './admin.routes';
import { authTree } from './auth.routes';
import { customerTree } from '@features/customer/routes/customer.routes';
import RootLayout from '@components/layout/route/RootLayout';
import NotFound from '@pages/NotFound';

const rootRoutes = createRootRoute({
  component: RootLayout,
});

const rootTree = rootRoutes.addChildren([mainTree, adminTree, authTree, customerTree]);

const router = createRouter({
  routeTree: rootTree,
  defaultNotFoundComponent: NotFound,
});

export { router, rootRoutes, rootTree };
