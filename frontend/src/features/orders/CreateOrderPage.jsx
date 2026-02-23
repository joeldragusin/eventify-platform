import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function CreateOrderForm({ eventId, tickets, onPlaced }) {
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
      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: 0 }}>Order tickets</h3>
        <p>No tickets available for purchase.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 max-w-[520px] rounded-lg border border-gray-300 bg-white p-3">
      <h3 className="mt-0 font-semibold">Order tickets</h3>

      {!isLoggedIn && (
        <p className="mt-2">
          You must be logged in to place an order.{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            Go to Login
          </button>
        </p>
      )}

      <form onSubmit={handlePlaceOrder}>
        {(tickets || []).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 border-b border-gray-200 py-2"
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
              className="w-20 rounded border border-gray-300 px-2 py-1"
              disabled={!isLoggedIn || loading}
            />
          </div>
        ))}

        <div className="mt-3 font-semibold">Total: {total} RON</div>

        <button
          type="submit"
          disabled={!isLoggedIn || loading}
          className="mt-3 rounded border border-gray-300 px-3 py-1"
        >
          {loading ? "Placing order..." : "Place order"}
        </button>

        {error && <p className="mt-2 text-red-600">{error}</p>}
      </form>
    </div>
  );
}
