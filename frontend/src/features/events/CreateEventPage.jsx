import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateEventPage() {
  const navigate = useNavigate();

  //defining the state for event creation form (input)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // ex: "28-04-2026"
  const [time, setTime] = useState(""); //ex: "20:30"""
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [venueId, setVenueId] = useState();
  const [category, setCategory] = useState();

  //defining as state the static image, so we replace Cloudinary
  const [image] = useState("/images/concert_1.jpg");

  //the usual UX states
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //logic to extract Venues in a later-to-build dropdown list
  useEffect(() => {
    async function loadVenues() {
      try {
        const res = await api.get("/venues");
        setVenues(res.data.venues || []);
      } catch (err) {
        console.log("loadVenues error: ", err?.response?.data || err.message);
      }
    }

    loadVenues();
  }, []);

  //logic to create an event
  async function createEvent(e) {
    e.preventDefault();
    setError("");

    //we validate the input of the descriptors
    if (!title || !date || !time || !capacity || !price) {
      setError("Title, date, time, capacity and price are required!");
    }

    try {
      setLoading(true);

      await api.post("/events", {
        title,
        description: description || null,
        date,
        time,
        capacity: Number(capacity),
        price: Number(price),
        venueId: venueId ? Number(venueId) : null,
        image,
      });

      //redirect to the Events page after successul Event creation
      navigate("/events");
    } catch (err) {
      console.log("createEvent error: ", err);
      setError(
        err?.response?.data?.error ||
          "Event could not be created. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  //finally, we render as usual
  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Create Event</h1>
      <form onSubmit={createEvent} style={{ marginTop: 16 }}>
        <label>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Time *</label>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Capacity *</label>
        <input
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Price (RON) *</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Category *</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Venue *</label>
        <select
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        >
          <option value="">-- Select Venue --</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating event..." : "Create Event"}
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  );
}
