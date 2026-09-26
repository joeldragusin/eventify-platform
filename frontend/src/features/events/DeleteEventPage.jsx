import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import PageLayout from "../../components/PageLayout.jsx";

export default function DeleteEventPage() {
  //we make sure frontend logic is aware of the backend eventId by reading it from the browser
  //we also use the bavigate variable so we return automatically to /events after deleting an event based on its id (read above commentary)
  const { id } = useParams();
  const navigate = useNavigate();

  //refer via useSelector to authentication since it's a global event which influences what user is allowed to see/edit or not
  const user = useSelector((state) => state.auth.user);

  //we declare the form state in order to delete an event: we first list the event by id
  //then we do the delete action on it, after we will navigate back to /events (we use navigate, as mentioned above)
  //the remaining form states are obvious: loading to load the event, or error in case something happens
  const [event, setEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //list by id the event so we can later rend it
  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        console.log("loadEvent error: ", err);
        const msg = err?.response?.data?.error || "Cannot load event, sorry.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  //we create variables that help us at rendering to allow deleting an event or not, depending on your role and plannerId
  const isAdmin = user?.role === "ADMIN";
  const isOwner = event?.plannerId === user?.id;
  const canDelete = isAdmin || isOwner;

  async function deleteEvent() {
    const ok = window.confirm("Are you sure you want to delete this event?");
    if (!ok) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/events/${id}`);

      //navigate back to events page after delete
      navigate("/events");
    } catch (err) {
      console.log("deleteEvent error: ", err);
      const msg = err?.response?.data?.error || "Cannot delete event, sorry.";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageLayout
      title="Delete Event"
      backTo={`/events/${id}`}
      backLabel="Back to Event"
      width="md"
    >
      {loading && <p className="text-slate-600 dark:text-slate-400">Loading...</p>}

      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && !event && (
        <div className="rounded-xl border bg-white p-4 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          Event not found.
        </div>
      )}

      {!loading && event && (
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-700 dark:text-slate-300">
            You are about to delete:
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              {event.title}
            </span>
          </p>

          {!canDelete && (
            <p className="mt-4 text-red-600 dark:text-red-400">
              You are not allowed to delete this event!
            </p>
          )}

          {canDelete && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={deleteEvent}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>

              <Link
                to={`/events/${id}`}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Link>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
