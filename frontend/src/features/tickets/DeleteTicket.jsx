import { useState } from "react";
import api from "../../api/axios.js";

export default function DeleteTicket({ ticketId, onDeleted }) {
  //we create the delete state to obviously delete the ticket
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("Are you sure you want to delete this event?");
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
      className="px-3 py-1.5 text-sm rounded border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {deleting ? "Deleting" : "Delete"}
    </button>
  );
}
