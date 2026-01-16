import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios.js";
import ReviewsList from "../reviews/ReviewsList.jsx";
import ReviewCreateForm from "../reviews/ReviewCreateForm.jsx";
import { useSelector } from "react-redux";

export default function EventsDetailsPage() {
  //conditions added before creating EditEventPage.jsx and DeleteEventPage.jsx, so we can access both Pages
  const user = useSelector((state) => state.auth.user);
  const canEdit = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");

  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

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
    async function loadTickets() {
      try {
        setTicketsLoading(true);
        setTicketsError("");

        const res = await api.get("/tickets", { params: { eventId: id } });
        setTickets(res.data.tickets || []);
      } catch (err) {
        console.error(err);
        setTicketsError("Can't load tickets.");
      } finally {
        setTicketsLoading(false);
      }
    }

    loadTickets();
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <Link to="/events">Back to Events</Link>

      {/*============THIS IS THE EVENT LOADING OR ERROR SECTION============*/}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && !event && <p>Event not found.</p>}

      {/*============THIS IS THE EVENT DETAILS SECTION============*/}
      {!loading && !error && event && (
        <div style={{ marginTop: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold" }}>{event.title}</h1>

          {/*here I add the button to edit the current event only as ADMIN or EVENT_PLANNER*/}
          {canEdit && (
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <Link to={`/events/${event.id}/edit`}>Edit Event</Link>
              <Link to={`/events/${event.id}/delete`}>Delete Event</Link>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <div>Price: {event.price} RON</div>
            <div>Capacity: {event.capacity} seats</div>
          </div>
          {event.description && (
            <p style={{ marginTop: 12 }}>{event.description}</p>
          )}
          {event.image && (
            <div style={{ marginTop: 12 }}>
              <img
                src={event.image}
                alt="event"
                style={{ maxWidth: 500, width: "100%", borderRadius: 8 }}
              />
            </div>
          )}
          {event.venue && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: "bold" }}>Venue</div>
              <div>{event.venue.name}</div>
              <div>{event.venue.address}</div>
            </div>
          )}
          {event.planner && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: "bold" }}>Planner</div>
              <div>{event.planner.name}</div>
              <div>{event.planner.email}</div>
            </div>
          )}
          {/*============THIS IS THE TICKETS SECTION============*/}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: "bold" }}>Tickets</h2>

            {ticketsLoading && <p>Loading tickets...</p>}
            {ticketsError && <p style={{ color: "red" }}>{ticketsError}</p>}

            {!ticketsLoading && !ticketsError && tickets.length === 0 && (
              <p>No tickets are available for this event.</p>
            )}

            {!ticketsLoading && !ticketsError && tickets.length > 0 && (
              <ul style={{ marginTop: 12 }}>
                {tickets.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      border: "1px solid #ccc",
                      padding: 10,
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{t.name}</div>
                    <div>Price: {t.price} RON</div>
                    <div>Available: {t.quantity}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ReviewCreateForm
            eventId={event.id}
            onCreated={() => setReviewsRefreshKey((x) => x + 1)}
          />
          <ReviewsList
            eventId={event.id}
            refreshKey={reviewsRefreshKey}
            onRefresh={() => setReviewsRefreshKey((x) => x + 1)}
          />
        </div>
      )}
    </div>
  );
}
