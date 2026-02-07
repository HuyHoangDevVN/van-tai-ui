/**
 * Customer Routes
 * Routes cho các trang khách hàng
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoutes } from '@routes/routes';
import CustomerLayout from '@components/layout/customer/CustomerLayout';

// Customer Layout Route
export const customerRoute = createRoute({
  getParentRoute: () => rootRoutes,
  id: 'customer',
  component: CustomerLayout,
});

// Search Trips Route
export const searchRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/search',
  component: lazyRouteComponent(() => import('../pages/SearchTrips')),
});

// Trip Detail Route
export const tripDetailRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/trip/$tripId',
  component: lazyRouteComponent(() => import('../pages/TripDetail')),
});

// Booking Route
export const bookingRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/booking',
  component: lazyRouteComponent(() => import('../pages/Booking')),
  validateSearch: (search: Record<string, unknown>) => ({
    tripId: search.tripId as string,
    seatId: search.seatId as string,
    viTri: search.viTri as string,
  }),
});

// My Tickets Route
export const myTicketsRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: '/my-tickets',
  component: lazyRouteComponent(() => import('../pages/MyTickets')),
});

// Export all customer routes
export const customerTree = customerRoute.addChildren([
  searchRoute,
  tripDetailRoute,
  bookingRoute,
  myTicketsRoute,
]);
