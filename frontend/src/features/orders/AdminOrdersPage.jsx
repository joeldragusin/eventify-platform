import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import PageLayout from "../../components/PageLayout.jsx";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAllOrders() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/orders"); // ADMIN endpoint
        setOrders(res.data.orders || []);
      } catch (err) {
        console.log("loadAllOrders error:", err);
        const msg =
          err?.response?.data?.error || "Can't load all orders (admin).";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadAllOrders();
  }, []);

  return (
    <PageLayout title="Admin Orders">
      {loading && <p className="text-slate-600 dark:text-slate-400">Loading...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border bg-white p-4 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          No orders yet.
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={`/admin/orders/${o.id}`}
                  className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
                >
                  Order #{o.id}
                </Link>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {o.status}
                </span>
              </div>

              <div className="mt-2 space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
                <div>Total: {o.total} RON</div>
                <div className="break-all">
                  User: {o.user?.email || o.userId}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Created:{" "}
                  {o.createdAt ? String(o.createdAt).slice(0, 19) : "-"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
