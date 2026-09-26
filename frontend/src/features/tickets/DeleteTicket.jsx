import { useState } from "react";
import api from "../../api/axios.js";

export default function DeleteTicket({ ticketId, onDeleted }) {
  //we create the delete state to obviously delete the ticket
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("Are you sure you want to delete this ticket?");
    if (!ok) return;

    try {
      setDeleting(true);

      await api.delete(`/tickets/${ticketId}`);

      //the parent component (TicketsList.jsx) will refresh the list component
      if (onDeleted) onDeleted();
    } catch (err) {
      console.log("handleDelete error: ", err);
      const msg = err?.response?.data?.error || "Delete ticket failed.";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950"
    >
      {deleting ? "Deleting" : "Delete"}
    </button>
  );
}
