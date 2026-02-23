import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios.js";
import ReviewsList from "../reviews/ReviewsList.jsx";
import ReviewCreateForm from "../reviews/ReviewCreateForm.jsx";
import TicketsList from "../tickets/TicketsList.jsx";
import CreateTicket from "../tickets/CreateTicket.jsx";
import { useSelector } from "react-redux";
import LoginButton from "../../components/LoginButton.jsx";
import CreateOrderPage from "../orders/CreateOrderPage.jsx";

export default function EventsDetailsPage() {
  //conditions added before creating EditEventPage.jsx and DeleteEventPage.jsx, so we can access both Pages
  const user = useSelector((state) => state.auth.user);
  const canEdit = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //we add a refreshKey component, which role is after user creates a ticket, the page refreshes itself immediately after posting submitting creation
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);

  //we create a refreshKey component also for reviews creation
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  //create a state for ordered tickets
  const [ticketsToOrder, setTicketsToOrder] = useState([]);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (error) {
        console.error(error);
        setError("Can't load event details.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [id]);

  useEffect(() => {
    async function loadTicketsToOrder() {
      try {
        const res = await api.get("/tickets", {
          params: { eventId: Number(id) },
        });

        setTicketsToOrder(res.data.tickets || []);
      } catch (err) {
        console.log("loadTicketsToOrder error: ", err);
        setTicketsToOrder([]);
      }
    }

    if (id) loadTicketsToOrder();
  }, [id, ticketsRefreshKey]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* top back link */}
      <div className="mb-4">
        <Link to="/events" className="text-sm font-medium text-blue-600">
          Back to Events
        </Link>
      </div>

      {/* loading / error */}
      {loading && (
        <div className="rounded-lg border bg-white p-4 text-sm">Loading...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !event && (
        <div className="rounded-lg border bg-white p-4 text-sm">
          Event not found.
        </div>
      )}

      {/* content */}
      {!loading && !error && event && (
        <div className="space-y-6">
          {/* header card */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <div className="mt-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Price:</span> {event.price}{" "}
                    RON
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span>{" "}
                    {event.capacity} seats
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-3">
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/events/${event.id}/delete`}
                    className="inline-flex items-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Link>
                </div>
              )}
            </div>

            {event.description && (
              <p className="mt-4 text-sm text-gray-800">{event.description}</p>
            )}

            {event.image && (
              <div className="mt-4">
                <img
                  src={event.image}
                  alt="event"
                  className="w-full max-w-2xl rounded-lg border object-cover"
                />
              </div>
            )}

            {/* venue + planner */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {event.venue && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="text-sm font-semibold">Venue</div>
                  <div className="mt-1 text-sm text-gray-800">
                    <div>{event.venue.name}</div>
                    <div className="text-gray-600">{event.venue.address}</div>
                  </div>
                </div>
              )}

              {event.planner && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="text-sm font-semibold">Planner</div>
                  <div className="mt-1 text-sm text-gray-800">
                    <div>{event.planner.name}</div>
                    <div className="text-gray-600">{event.planner.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tickets section */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Tickets</h2>

            <TicketsList
              eventId={event.id}
              refreshKey={ticketsRefreshKey}
              onRefresh={() => setTicketsRefreshKey((c) => c + 1)}
            />

            <div className="mt-4">
              {user ? (
                <CreateTicket
                  eventId={event.id}
                  onCreation={() => setTicketsRefreshKey((c) => c + 1)}
                />
              ) : (
                <LoginButton message="Log in to create ticket (admin/planners only)" />
              )}
            </div>

            <div className="mt-4">
              {user ? (
                <CreateOrderPage
                  eventId={event.id}
                  tickets={ticketsToOrder}
                  onPlaced={() => setTicketsRefreshKey((c) => c + 1)}
                />
              ) : (
                <LoginButton message="Log in to create an order" />
              )}
            </div>
          </div>

          {/* Reviews section */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Reviews</h2>

            <div className="mb-4">
              {user ? (
                <ReviewCreateForm
                  eventId={event.id}
                  onCreated={() => setReviewsRefreshKey((x) => x + 1)}
                />
              ) : (
                <LoginButton message="Log in to create a review" />
              )}
            </div>

            <ReviewsList
              eventId={event.id}
              refreshKey={reviewsRefreshKey}
              onRefresh={() => setReviewsRefreshKey((x) => x + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
