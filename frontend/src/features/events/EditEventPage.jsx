import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function EditEventPage() {
  //useParams takes the id from the URL exactly as written in AppRouter.jsx for this specific page
  //acts as a bridge between the URL, the page and the backend request
  const { id } = useParams();
  const navigate = useNavigate();

  //states of the form  in which we will edit the event
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // ex: "28-04-2026"
  const [time, setTime] = useState(""); //ex: "20:30"""
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [venueId, setVenueId] = useState();
  const [category, setCategory] = useState();
  const [image, setImage] = useState("");

  //the usual UX states
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //function that loads the event from backend
  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/events/${id}`);
        const ev = res.data.event;

        //when the form finishes loading, we will have the event data extracted from the backend
        setTitle(ev.title);
        setDescription(ev.description || "");
        setDate(ev.date.slice(0, 10)); //to make sure it appears yyyy-mm-dd i sliced the first 10 indexes of the string
        setTime(ev.time);
        setCapacity(ev.capacity);
        setPrice(ev.price);
        setCategory(ev.category || "");
        setVenueId(ev.venueId || "");
        setImage(ev.image || "");
      } catch (err) {
        console.log("loadEvent error: ", err);
        const msg =
          err?.response?.data?.error ||
          "Event could not be loaded. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  //now we defined the edit itself aka what happens when we submit the changes
  async function updateEvent(e) {
    //we block reload of the page, in order not to lose all details we changed in the form
    e.preventDefault();
    setError("");

    //we validate the input of the descriptors
    if (!title || !date || !time || !capacity || !price) {
      setError("Title, date, time, capacity and price are required!");
    }

    try {
      setSaving(true);

      await api.patch(`/events/${id}`, {
        title,
        description: description || null,
        date: date,
        time: time,
        capacity: Number(capacity),
        price: Number(price),
        category: category || null,
        venueId: venueId ? Number(venueId) : null,
        image: image || null,
      });

      //afetr the successful patch, we navigate back to details of the edited event
      navigate(`/events/${id}`);
    } catch (err) {
      console.log("updateEvent error: ", err);
      const msg = err?.response?.data?.error || "Event could not be updated.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  //basic loading render
  if (loading) return <p>Loading event...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Edit Event</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={updateEvent} style={{ maxWidth: 520, marginTop: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Capacity
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Category
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}
          >
            Image URL (optional)
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
