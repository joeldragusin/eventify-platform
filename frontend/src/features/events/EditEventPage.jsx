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

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        {loading && <p className="mt-2 text-gray-600">Loading event...</p>}

        {error && <p className="mt-2 text-red-600">{error}</p>}

        <form onSubmit={updateEvent} className="mt-3 max-w-[520px]">
          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block font-semibold">
              Image URL (optional)
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
