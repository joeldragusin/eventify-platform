import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Link } from "react-router-dom";

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
          "Event could not be created. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  //finally, we render as usual
  return (
    <div className="p-6">
      <div className="mx-auto max-w-xl">
        <Link to="/events" className="text-sm text-gray-700 hover:text-black">
          Back to Events
        </Link>

        <h1 className="mt-3 text-2xl font-bold">Create Event</h1>

        <form
          onSubmit={createEvent}
          className="mt-4 rounded-lg border border-gray-300 bg-white p-4"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Time *</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="20:30"
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Capacity *</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Price (RON) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Venue</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              >
                <option value="">-- Select Venue --</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded border border-gray-300 px-3 py-1"
            >
              {loading ? "Creating event..." : "Create Event"}
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
