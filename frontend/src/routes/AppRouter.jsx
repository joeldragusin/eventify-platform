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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<EventsDetailsPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/:id/edit" element={<EditEventPage />} />
        <Route path="/events/:id/delete" element={<DeleteEventPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
