import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function EventsListPage() {
  //condition to show the Create Events button/option
  const user = useSelector((state) => state.auth.user);
  const canCreate = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  //define state form for events to be listed from the backend
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/events");
        setEvents(res.data.events || []);
      } catch (error) {
        console.error(error);
        setError("Can't load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Events</h1>
      {canCreate && (
        <div style={{ marginTop: 12 }}>
          <Link to="/events/create">
            <button>Create Event</button>
          </Link>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p>There are no available events yet.</p>
      )}
      {!loading && !error && events.length > 0 && (
        <ul style={{ marginTop: 16, padding: 0, listStyle: "none" }}>
          {events.map((ev) => {
            const dateText = ev.date ? ev.date.slice(0, 10) : "-";

            return (
              <li
                key={ev.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  <Link to={`/events/${ev.id}`}>{ev.title}</Link>
                </div>

                <div style={{ marginTop: 6 }}>
                  <div>Data: {dateText}</div>
                  <div>Ora: {ev.time}</div>
                </div>

                <div style={{ marginTop: 6 }}>
                  Price: {ev.price} RON
                  <br />
                  Capacity: {ev.capacity} seats
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
