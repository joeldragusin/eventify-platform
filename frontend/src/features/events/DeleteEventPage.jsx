import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";

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
  const [laoding, setLoading] = useState(true);
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

  if (laoding) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Delete Event</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!event && !error && <p>Event not found.</p>}

      {event && (
        <>
          <p style={{ marginTop: 12 }}>
            You are about to delete:
            <b>{event.title}</b>
          </p>

          {!canDelete && (
            <p style={{ color: "red", marginTop: 12 }}>
              You are not allowed to delete this event!
            </p>
          )}

          {canDelete && (
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button onClick={deleteEvent} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>

              <Link to={`/events/${id}`}>Cancel</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
