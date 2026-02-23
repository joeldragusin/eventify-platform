import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import EditTicket from "./EditTicket.jsx";
import DeleteTicket from "./DeleteTicket.jsx";
import { useSelector } from "react-redux";

//we will be exporting this function in the EventsDetailsPage, so when we click an event we can see its associated tickets
//furthermore, giving these 3 input pramaeters, we will grant them values EventsDetailsPage in order for the magic to happen, meaning
//after we create/delete/edit a ticket(of course, as ADMIN or EVENT_PLANNER), the component refreshes itself (no need to refresh the browser) therefore changing its value
export default function TicketsList({ eventId, refreshKey, onRefresh }) {
  //we select the user global state aka from Redux (from login)
  const user = useSelector((state) => state.auth.user);

  //condition so only the admin or event owner sees the form
  const canManage = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //state used when editing a ticket
  const [editingTicket, setEditingTicket] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    async function loadTickets() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/tickets", {
          params: { eventId: Number(eventId) },
        });
        setTickets(res.data.tickets || []);
      } catch (err) {
        console.log("loadTickets error: ", err);
        setError("Cannot load tickets, sorry.");
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [eventId, refreshKey]);

  return (
    <div className="space-y-3">
      {loading && <p className="text-sm text-gray-700">Loading tickets...</p>}

      {error && <p className="text-sm text-gray-700">{error}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p className="text-sm text-gray-700">
          No tickets are available for this event.
        </p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Price (RON):</span>{" "}
                      {t.price}
                    </div>
                    <div>
                      <span className="font-medium">Available:</span>{" "}
                      {t.quantity}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingTicket(t)}
                      className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <DeleteTicket
                      ticketId={t.id}
                      onDeleted={() => {
                        if (onRefresh) onRefresh();
                      }}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit form */}
      {canManage && editingTicket && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <EditTicket
            ticket={editingTicket}
            onCancel={() => setEditingTicket(null)}
            onSaved={() => {
              setEditingTicket(null);
              if (onRefresh) onRefresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
