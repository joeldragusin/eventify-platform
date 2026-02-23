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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/" className="text-sm text-slate-700 hover:text-slate-900">
          Back to Homepage
        </Link>

        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Events</h1>

          {canCreate && (
            <Link
              to="/events/create"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Event
            </Link>
          )}
        </div>

        {loading && <p className="mt-6 text-sm text-slate-600">Loading...</p>}

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="mt-6 text-sm text-slate-600">
            There are no available events yet.
          </p>
        )}

        {!loading && !error && events.length > 0 && (
          <ul className="mt-6 grid gap-4">
            {events.map((ev) => {
              const dateText = ev.date ? ev.date.slice(0, 10) : "-";

              return (
                <li
                  key={ev.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/events/${ev.id}`}
                        className="block truncate text-lg font-semibold text-slate-900 hover:underline"
                      >
                        {ev.title}
                      </Link>

                      <div className="mt-2 text-sm text-slate-700">
                        <div>
                          <span className="font-medium">Date:</span> {dateText}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {ev.time}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right text-sm text-slate-700">
                      <div>
                        <span className="font-medium">Price:</span> {ev.price}{" "}
                        RON
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span>{" "}
                        {ev.capacity} seats
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
