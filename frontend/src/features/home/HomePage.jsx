import { Link } from "react-router-dom";
import LogoutButton from "../auth/LogoutButton.jsx";
import { useSelector } from "react-redux";

export default function HomePage() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-slate-900">EventUp</h1>

        {/* Authentication part */}
        <div className="mt-4">
          {!user ? (
            <div className="flex gap-4">
              {/* Login button */}
              <Link
                to="/login"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              >
                Login
              </Link>

              {/* Register button */}
              <Link
                to="/register"
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-900 hover:bg-slate-100"
              >
                Create an account
              </Link>
            </div>
          ) : (
            <LogoutButton />
          )}
        </div>

        {/* Motto */}
        <p className="mt-6 text-lg text-slate-700">
          Find events, buy tickets and leave a review!
        </p>

        {/* Main navigation */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/events"
            className="rounded-xl border bg-white p-4 text-center font-medium text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Events
          </Link>

          <Link
            to="/venues"
            className="rounded-xl border bg-white p-4 text-center font-medium text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Venues
          </Link>

          <Link
            to="/testimonials"
            className="rounded-xl border bg-white p-4 text-center font-medium text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Testimonials
          </Link>

          {user && (
            <Link
              to="/orders/my"
              className="rounded-xl border bg-white p-4 text-center font-medium text-slate-900 shadow-sm hover:bg-slate-100"
            >
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/orders"
              className="rounded-xl border bg-slate-900 p-4 text-center font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Admin Orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
