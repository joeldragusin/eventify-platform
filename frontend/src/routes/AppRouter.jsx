import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../features/home/HomePage.jsx";
import LoginPage from "../features/auth/LoginPage.jsx";
import RegisterPage from "../features/auth/RegisterPage.jsx";
import EventsListPage from "../features/events/EventsListPage.jsx";
import EventsDetailsPage from "../features/events/EventsDetailsPage.jsx";
import CreateEventPage from "../features/events/CreateEventPage.jsx";
import EditEventPage from "../features/events/EditEventPage.jsx";
import DeleteEventPage from "../features/events/DeleteEventPage.jsx";
import TestimonialsPage from "../features/testimonials/TestimonialsPage.jsx";
import VenuesPage from "../features/venues/VenuesPage.jsx";
import RequireAuth from "./RequireAuth.jsx";
import RequireRole from "./RequireRole.jsx";
import MyOrdersPage from "../features/orders/MyOrdersPage.jsx";
import MyOrderDetailsPage from "../features/orders/MyOrderDetailsPage.jsx";
import AdminOrdersPage from "../features/orders/AdminOrdersPage.jsx";
import AdminOrderStatusPage from "../features/orders/AdminOrderStatusPage.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/*These are publicly available routes, meaning everyone can see them without having an account*/}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<EventsDetailsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/venues" element={<VenuesPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/*These are available only after authentication, meaning only registered users can see them*/}
        <Route element={<RequireAuth />}>
          <Route path="/orders/my" element={<MyOrdersPage />} />
          <Route path="/orders/my/:id" element={<MyOrderDetailsPage />} />
        </Route>

        {/*These routes are available only for the ADMIN*/}
        <Route path="/admin/orders" element={<AdminOrdersPage />} />

        <Route path="/admin/orders/:id" element={<AdminOrderStatusPage />} />

        {/*These are protected routes, for which login is needed in order to see them, if you have the required roles*/}
        <Route element={<RequireAuth />}>
          <Route
            element={
              <RequireRole
                roles={["ADMIN", "EVENT_PLANNER"]}
                redirectTo="/events"
              />
            }
          >
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/:id/edit" element={<EditEventPage />} />
            <Route path="/events/:id/delete" element={<DeleteEventPage />} />

            <Route path="admin/orders" element={<AdminOrdersPage />} />
            <Route path="admin/orders/:id" element={<AdminOrderStatusPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
