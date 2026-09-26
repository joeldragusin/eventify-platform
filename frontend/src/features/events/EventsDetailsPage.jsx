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
import PageLayout from "../../components/PageLayout.jsx";

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
    <PageLayout
      title={event?.title || "Event"}
      backTo="/events"
      backLabel="Back to Events"
      width="xl"
    >
      {/* loading / error */}
      {loading && (
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          Loading...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && !event && (
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          Event not found.
        </div>
      )}

      {/* content */}
      {!loading && !error && event && (
        <div className="space-y-6">
          {/* header card */}
          <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {String(event.date).slice(0, 10)}
                </div>
                <div>
                  <span className="font-medium">Time:</span> {event.time}
                </div>
                <div>
                  <span className="font-medium">Price:</span> {event.price} RON
                </div>
                <div>
                  <span className="font-medium">Capacity:</span>{" "}
                  {event.capacity} seats
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-3">
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/events/${event.id}/delete`}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </Link>
                </div>
              )}
            </div>

            {event.description && (
              <p className="mt-4 text-sm text-slate-800 dark:text-slate-200">{event.description}</p>
            )}

            {event.image && (
              <div className="mt-4">
                <img
                  src={event.image}
                  alt="event"
                  className="w-full max-w-2xl rounded-lg border object-cover dark:border-slate-700"
                />
              </div>
            )}

            {/* venue + planner */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {event.venue && (
                <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900 dark:border-slate-700">
                  <div className="text-sm font-semibold">Venue</div>
                  <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                    <div>{event.venue.name}</div>
                    <div className="text-slate-600 dark:text-slate-400">{event.venue.address}</div>
                  </div>
                </div>
              )}

              {event.planner && (
                <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900 dark:border-slate-700">
                  <div className="text-sm font-semibold">Planner</div>
                  <div className="mt-1 break-all text-sm text-slate-800 dark:text-slate-200">
                    <div>{event.planner.name}</div>
                    <div className="text-slate-600 dark:text-slate-400">{event.planner.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tickets section */}
          <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
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
          <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
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
    </PageLayout>
  );
}
