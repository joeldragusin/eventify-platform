import { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";

export default function CreateTicket({ eventId, onCreation }) {
  //we select the user global state aka from Redux (from login)
  const user = useSelector((state) => state.auth.user);

  //condition so only the admin or event owner sees the form
  const isOwner = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  //now we create the form state, where the owner selects the name (type of ticket), price and quantity
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  //we also create the usual UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //using React's naming convention to anem functions that respond to events, we usually name them handle + a specific action,
  //although we can name them however we want, for example ticketCreate()
  //in this specific case, I chose to name it based on the convention, therefore handleCreate
  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    //now a set of validations for all data going to the specific backend controller that creates the ticket
    if (!eventId) {
      setError("Missing eventId. Cannot create the ticket. Sorry mate.");
      return;
    }

    if (!name.trim()) {
      setError("Ticket name is required mate.");
      return;
    }

    const priceNum = Number(price);
    const qtyNum = Number(quantity);

    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number mate.");
      return;
    }

    if (Number.isNaN(qtyNum) || qtyNum < 0) {
      setError("Quantity must be a positive number mate.");
      return;
    }

    try {
      setLoading(true);

      //now we post into the database via axios. we reference directly the db columns as keys and the input from the form as values
      await api.post("/tickets", {
        name: name.trim(),
        price: priceNum,
        quantity: qtyNum,
        eventId: Number(eventId),
      });

      //now we reset the creation form
      setName("");
      setPrice("");
      setQuantity("");

      //now I will let the parent component/page (EventDetailsPage) it can redo the list of tickets when calling onCreation on its page
      if (onCreation) onCreation();
    } catch (err) {
      console.log("createTicket error: ", err);
      const msg =
        err?.response?.data?.error || "Ticket could not be created mate.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!isOwner) return null;

  return (
    <div className="mt-4 border border-gray-300 rounded-lg p-3 max-w-[520px]">
      <h3 className="mt-0 text-base font-semibold">Create Ticket</h3>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <form onSubmit={handleCreate} className="mt-3">
        <div className="mb-3">
          <label className="block text-sm font-medium">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Price (RON) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
