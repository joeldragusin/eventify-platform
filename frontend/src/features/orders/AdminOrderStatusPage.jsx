import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";
import PageLayout from "../../components/PageLayout.jsx";

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
      <PageLayout title="Update Order Status">
        <div className="rounded-xl border bg-white p-4 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          Admins only.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Update Order #${id} Status`}
      backTo="/admin/orders"
      backLabel="Back to Admin Orders"
      width="md"
    >
      <form
        onSubmit={handleUpdate}
        className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700"
      >
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? "Updating..." : "Update status"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </PageLayout>
  );
}
