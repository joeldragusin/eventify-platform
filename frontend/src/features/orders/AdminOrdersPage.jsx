import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

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
    <div className="p-6">
      <Link to="/" className="text-sm">
        Back to Home
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Admin Orders</h1>

      {loading && <p className="mt-3">Loading...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="mt-3">No orders yet.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="mt-3 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-lg border border-gray-300 p-3">
              <div className="font-semibold">
                <Link
                  to={`/admin/orders/${o.id}`}
                  className="text-gray-800 hover:text-black"
                >
                  Order #{o.id}
                </Link>
              </div>

              <div className="mt-1 text-sm">Status: {o.status}</div>
              <div className="text-sm">Total: {o.total} RON</div>
              <div className="text-sm">User: {o.user?.email || o.userId}</div>

              <div className="mt-2 text-xs text-gray-600">
                Created: {o.createdAt ? String(o.createdAt).slice(0, 19) : "-"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
