import { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

//this represents the review form which can be submitted and the user is able to see
export default function ReviewCreateForm({ eventId, onCreated }) {
  //this is the initial input of the taste
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  //state for the asynchronos requests
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //here we handle the submission of the form
  //we validate the client, call the api from backend reset the form
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
      toast.success("Your review has been posted!");

      //reset the review form to default
      setRating(5);
      setComment("");

      //i tell the parent a review has been created so it reloads/rerenders the reviews (its state)
      if (onCreated) onCreated();
    } catch (err) {
      console.error("ReviewCreateForm error: ", err);
      const msg =
        err?.response?.data?.error ||
        "Review could not be created. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="m-0 mb-3 text-lg font-semibold">Leave a review</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">
            Rating (1 to 5 stars)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? "Sending..." : "Submit review"}
        </button>

        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </div>
  );
}
