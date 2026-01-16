import { useState } from "react";
import api from "../../api/axios";

export default function ReviewCreateForm({ eventId, onCreated }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    //first create the condition to rate events from 1 to 5 only
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    //we start building the logic in a try-catch-finally block, as protection mechanism
    try {
      setLoading(true);

      //POST = create a review in frontend (which obviously arrives first to the backend)
      await api.post("/reviews", {
        eventId: eventId,
        rating: ratingNum,
        comment: comment.trim() || null,
      });

      //reset the review form to default
      setRating(5);
      setComment("");

      //ii spun parintelui ca s-a creat un review si sa reincerca lista (State-ul)
      if (onCreated) onCreated();
    } catch (err) {
      console.error("ReviewCreateForm error: ", err);
      const msg =
        err?.response?.error ||
        "Review could not be created. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #ccc",
        padding: 12,
        borderRadius: 8,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 10 }}>Leave a review</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Rating (1 to 5 stars)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Submit review"}
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  );
}
