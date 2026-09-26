import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";
import PageLayout from "../../components/PageLayout.jsx";

export default function MyOrdersPage() {
  // user vine din Redux (authSlice)
  const user = useSelector((state) => state.auth.user);

  // state pentru lista de comenzi + UX (loading/error)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // daca nu e logat, nu mai fac request-ul
    if (!user) return;

    async function loadMyOrders() {
      try {
        setLoading(true);
        setError("");

        // backend: GET /api/orders/my -> { count, orders }
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.log("loadMyOrders error:", err);
        const msg = err?.response?.data?.error || "Could not load your orders.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadMyOrders();
  }, [user]);

  // daca nu e logat -> arat "go to login"
  if (!user) {
    return (
      <PageLayout title="My Orders">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-700 dark:text-slate-300">
            You must be logged in to view your orders.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Go to Login
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Orders">
      {loading && <p className="text-slate-600 dark:text-slate-400">Loading...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border bg-white p-4 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          You have no orders yet.
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Order #{o.id}
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {o.status}
                </span>
              </div>

              <div className="mt-2 space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
                <div>Total: {o.total} RON</div>
                <div>Items: {(o.orderItems || []).length}</div>
                <div>Date: {String(o.createdAt).slice(0, 10)}</div>
              </div>

              <Link
                to={`/orders/my/${o.id}`}
                className="mt-3 inline-block text-sm font-medium text-slate-900 underline dark:text-slate-100"
              >
                View details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
