import { createHashRouter, Navigate } from "react-router-dom";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminCinemasPage } from "@/pages/admin/AdminCinemasPage";
import { AdminConcessionsPage } from "@/pages/admin/AdminConcessionsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminMoviesPage } from "@/pages/admin/AdminMoviesPage";
import { AdminShowtimesPage } from "@/pages/admin/AdminShowtimesPage";
import { AccountPage } from "@/pages/AccountPage";
import { CinemasPage } from "@/pages/CinemasPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { FoodAndDrinkPage } from "@/pages/FoodAndDrinkPage";
import { HomePage, MoviesPage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { MyTicketsPage } from "@/pages/MyTicketsPage";
import { SeatSelectionPage } from "@/pages/SeatSelectionPage";
import { BookingPage } from "@/pages/BookingPage";
import { ShowtimesPage } from "@/pages/ShowtimesPage";
import { TicketQRPage } from "@/pages/TicketQRPage";

export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/home" replace /> },
      { path: "/home", element: <HomePage /> },
      { path: "/movies", element: <MoviesPage /> },
      { path: "/booking", element: <BookingPage /> },
      { path: "/showtimes", element: <ShowtimesPage /> },
      { path: "/showtimes/:movieSlug", element: <ShowtimesPage /> },
      { path: "/cinemas", element: <CinemasPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/food-drink", element: <FoodAndDrinkPage /> },
          { path: "/book/seats/:showtimeId", element: <SeatSelectionPage /> },
          { path: "/book/checkout/:bookingId", element: <CheckoutPage /> },
        ],
      },
      { path: "/ticket/:bookingId", element: <TicketQRPage /> },
      { path: "/tickets", element: <MyTicketsPage /> },
      { path: "/account", element: <AccountPage /> },
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
          { path: "/admin/movies", element: <AdminMoviesPage /> },
          { path: "/admin/cinemas", element: <AdminCinemasPage /> },
          { path: "/admin/showtimes", element: <AdminShowtimesPage /> },
          { path: "/admin/concessions", element: <AdminConcessionsPage /> },
        ],
      },
    ],
  },
]);
