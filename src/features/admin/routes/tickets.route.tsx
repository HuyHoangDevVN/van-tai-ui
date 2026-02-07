/**
 * Ticket Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Ticket booking route
export const ticketBookingRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/tickets',
  component: lazyRouteComponent(() => import('@features/admin/pages/tickets/TicketBooking')),
});

// Export all ticket routes
export const ticketRoutes = [ticketBookingRoute];
