import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function CreateOrderForm({ tickets, onPlaced }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

  // cart: { [ticketId]: quantity }
  const [qtyByTicketId, setQtyByTicketId] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => {
    if (!tickets || tickets.length === 0) return 0;

    let sum = 0;
    for (const t of tickets) {
      const q = Number(qtyByTicketId[t.id] || 0);
      if (q > 0) sum += q * Number(t.price || 0);
    }
    return sum;
  }, [tickets, qtyByTicketId]);

  function setQty(ticketId, newQty) {
    const q = Number(newQty);
    setQtyByTicketId((prev) => ({
      ...prev,
      [ticketId]: Number.isNaN(q) ? 0 : q,
    }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // build items
    const items = (tickets || [])
      .map((t) => ({
        ticketId: Number(t.id),
        quantity: Number(qtyByTicketId[t.id] || 0),
      }))
      .filter((it) => it.quantity > 0);

    if (items.length === 0) {
      setError("Select at least 1 ticket.");
      return;
    }

    // basic validation vs availability
    for (const it of items) {
      const t = tickets.find((x) => x.id === it.ticketId);
      if (!t) continue;
      if (it.quantity > Number(t.quantity)) {
        setError(`Not enough availability for "${t.name}".`);
        return;
      }
    }

    try {
      setLoading(true);

      // IMPORTANT: adjust body if your backend expects something else
      const res = await api.post("/orders", {
        orderItems: items,
      });

      if (onPlaced) onPlaced();

      setQtyByTicketId({});
      toast.success("Your order was placed with success!");
      // If backend returns order id, go to details.
      const createdId = res?.data?.order?.id || res?.data?.id;
      if (createdId) {
        navigate(`/orders/my/${createdId}`);
      } else {
        navigate("/orders/my");
      }
    } catch (err) {
      console.log("placeOrder error:", err);
      const msg =
        err?.response?.data?.error ||
        "Order could not be created. Please try again.";
      setError(msg);
      toast.error(msg);

      if (err?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="font-semibold">Order tickets</h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          No tickets available for purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mt-0 font-semibold">Order tickets</h3>

      {!isLoggedIn && (
        <p className="mt-2">
          You must be logged in to place an order.{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Go to Login
          </button>
        </p>
      )}

      <form onSubmit={handlePlaceOrder}>
        {(tickets || []).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 border-b border-gray-200 py-2 dark:border-slate-700"
          >
            <div className="flex-1">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs">
                Price: {t.price} RON • Available: {t.quantity}
              </div>
            </div>

            <input
              type="number"
              min="0"
              max={t.quantity}
              value={qtyByTicketId[t.id] ?? 0}
              onChange={(e) => setQty(t.id, e.target.value)}
              className="w-20 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              disabled={!isLoggedIn || loading}
            />
          </div>
        ))}

        <div className="mt-3 font-semibold">Total: {total} RON</div>

        <button
          type="submit"
          disabled={!isLoggedIn || loading}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? "Placing order..." : "Place order"}
        </button>

        {error && <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </div>
  );
}
