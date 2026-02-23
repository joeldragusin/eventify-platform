import { useSelector } from "react-redux";
import { useState } from "react";
import api from "../../api/axios.js";

export default function EditTicket({ ticket, onSaved, onCancel }) {
  //we select the user global state aka from Redux (from login)
  const user = useSelector((state) => state.auth.user);

  //condition so only the admin or event owner sees the form
  const isOwner = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  //now we create the edit form state, where the owner edits the name (type of ticket), price and quantity
  const [name, setName] = useState(ticket?.name || "");
  const [price, setPrice] = useState(ticket?.price ?? "");
  const [quantity, setQuantity] = useState(ticket?.quantity ?? "");

  //we also create the usual UX state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    //now a set of validations for all data going to the specific backend controller that creates the ticket
    if (!isOwner) {
      setError("You do not have permissions to edit a ticket.");
      return;
    }

    if (!name.trim()) {
      setError("Ticket name is required.");
      return;
    }

    const priceNum = Number(price);
    const qtyNum = Number(quantity);

    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    if (Number.isNaN(qtyNum) || qtyNum < 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(`/tickets/${ticket.id}`, {
        name: name.trim(),
        price: priceNum,
        quantity: qtyNum,
      });

      //the parent component (TicketsList.jsx) will save the component
      if (onSaved) onSaved();

      //also, we have the option to close the edit form. the command is once again executed in the parent component
      if (onCancel) onCancel();
    } catch (err) {
      console.log("handleSave error: ", err);
      const msg = err?.response?.data?.error || "Ticket could not be edited.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-3">
      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price (RON)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            disabled={saving}
          />
        </div>

        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    </form>
  );
}
