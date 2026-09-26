import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios.js";
import PageLayout from "../../components/PageLayout.jsx";

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
    <PageLayout
      title={`Order #${id}`}
      backTo="/orders/my"
      backLabel="Back to My Orders"
    >
      {loading && <p className="text-slate-600 dark:text-slate-400">Loading order...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && !order && (
        <p className="text-slate-700 dark:text-slate-300">Order not found.</p>
      )}

      {!error && order && (
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Total:</span> {order.total} RON
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {order.status}
            </span>
          </div>

          <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Items</h2>

          {!order.orderItems || order.orderItems.length === 0 ? (
            <p className="mt-2 text-slate-700 dark:text-slate-300">No items in this order.</p>
          ) : (
            <ul className="mt-2 divide-y dark:divide-slate-700">
              {order.orderItems.map((it) => (
                <li key={it.id} className="py-2">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {it.ticket?.name || "Ticket"}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Qty: {it.quantity} - Unit price: {it.unitPrice} RON
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PageLayout>
  );
}
