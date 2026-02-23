MyOrdersPage.jsx;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";

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
      <div style={{ padding: 24 }}>
        <Link to="/">Back to Home</Link>

        <h1 style={{ fontSize: 24, fontWeight: "bold", marginTop: 12 }}>
          My Orders
        </h1>

        <p>You must be logged in to view your orders.</p>

        <Link to="/login">
          <button>Go to Login</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/" className="text-sm underline">
        Back to Home
      </Link>

      <h1 className="mt-3 text-2xl font-bold">My Orders</h1>

      {loading && <p className="mt-3">Loading...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="mt-3">You have no orders yet.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="mt-3 space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-lg border border-gray-300 bg-white p-3"
            >
              <div className="font-semibold">
                Order #{o.id} — {o.status}
              </div>

              <div className="mt-2 text-sm">
                <div>Total: {o.total} RON</div>
                <div>Items: {(o.orderItems || []).length}</div>
                <div>Date: {String(o.createdAt).slice(0, 10)}</div>
              </div>

              <div className="mt-2">
                <Link to={`/orders/my/${o.id}`} className="text-sm underline">
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
