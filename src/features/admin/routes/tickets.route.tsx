/**
 * Ticket Routes
 */

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@routes/admin.routes';

// Ticket booking route - using enhanced page with seat validation
export const ticketBookingRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/tickets',
  component: lazyRouteComponent(
    () => import('@features/admin/pages/tickets/TicketManagementEnhanced'),
  ),
});

// Export all ticket routes
export const ticketRoutes = [ticketBookingRoute];
