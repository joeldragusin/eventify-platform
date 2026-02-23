import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";

export default function AdminOrderStatusPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [status, setStatus] = useState("PAID");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");

    if (!isAdmin) {
      setError("Admins only.");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/orders/${id}/status`, { status });
      nav("/admin/orders");
    } catch (err) {
      console.log("updateStatus error:", err);
      const msg = err?.response?.data?.error || "Can't update order status.";
      setError(msg);
      if (err?.response?.status === 401) nav("/login");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <Link to="/">Back to Home</Link>
        <p style={{ marginTop: 12 }}>Admins only.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        to="/admin/orders"
        className="text-sm text-gray-700 hover:text-black"
      >
        Back to Admin Orders
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Update Order #{id} Status</h1>

      <form
        onSubmit={handleUpdate}
        className="mt-4 max-w-sm rounded-lg border border-gray-300 p-4"
      >
        <label className="block text-sm font-medium">Status</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 rounded border border-gray-300 px-3 py-1"
        >
          {loading ? "Updating..." : "Update status"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
