import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios.js";

export default function MyOrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        // backend: GET /api/orders/my/:id
        const res = await api.get(`/orders/my/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.log("loadOrder error:", err);
        const msg =
          err?.response?.data?.error || "Can't load this order right now.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  return (
    <div className="p-6">
      <Link to="/orders/my" className="text-sm underline">
        Back to My Orders
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Order #{id}</h1>

      {loading && <p className="mt-3">Loading order...</p>}

      {error && <p className="mt-3 text-red-600">{error}</p>}

      {!error && !order && <p className="mt-3">Order not found.</p>}

      {!error && order && (
        <div className="mt-3">
          <div>
            <span className="font-semibold">Status:</span> {order.status}
          </div>
          <div className="mt-1">
            <span className="font-semibold">Total:</span> {order.total} RON
          </div>

          <h3 className="mt-4 font-semibold">Items</h3>

          {!order.orderItems || order.orderItems.length === 0 ? (
            <p className="mt-2">No items in this order.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {order.orderItems.map((it) => (
                <li key={it.id}>
                  <div className="font-semibold">
                    {it.ticket?.name || "Ticket"}
                  </div>
                  <div className="text-sm">
                    Qty: {it.quantity} - Unit price: {it.unitPrice} RON
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
