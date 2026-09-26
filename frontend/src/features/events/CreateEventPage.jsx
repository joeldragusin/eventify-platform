import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PageLayout from "../../components/PageLayout.jsx";

export default function CreateEventPage() {
  const navigate = useNavigate();

  //defining the state for event creation form (input)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // ex: "28-04-2026"
  const [time, setTime] = useState(""); //ex: "20:30"""
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [venueId, setVenueId] = useState("");
  const [category, setCategory] = useState("");

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
      return;
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
    <PageLayout
      title="Create Event"
      backTo="/events"
      backLabel="Back to Events"
      width="md"
    >
      <form
        onSubmit={createEvent}
        className="space-y-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Title <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Date <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Time <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Capacity <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Price (RON) <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Venue
          </label>
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">-- Select Venue --</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
          {loading ? "Creating event..." : "Create Event"}
        </button>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </PageLayout>
  );
}
