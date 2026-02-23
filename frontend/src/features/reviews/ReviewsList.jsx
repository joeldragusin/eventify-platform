import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

//here we take the existing reviews from the backend
//we take them again when eventId changes or refreshKey is updatec
export default function ReviewsList({ eventId, refreshKey, onRefresh }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //we read the authenticated user from Redux store
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  //the reviews are extracted from backend in two cases:
  //1.the chosen event changes
  //2.refrshKey changes (when is triggered from the parent pages)
  useEffect(() => {
    if (!eventId) return;

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        //calling the backedn API: GET /api/reviews?eventId=7 for exampel
        const res = await api.get(`/reviews?eventId=${eventId}`);

        //I am expecting the reviews to come
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.log("loadReviews error: ", err);
        setError("Can't load reviews.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [eventId, refreshKey]);

  //it deletes a review in the parent page and creates a refresh on it
  //both frontend and backend parts implement authorization for this action
  async function handleDelete(reviewId) {
    const ok = window.confirm("Delete this review?");
    if (!ok) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("You just deleted your review.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.log("deleteReview error: ", err);
      const msg = err?.response?.data?.error || "Delete review failed.";
      toast.error(msg);
    }
  }

  //this is where we edit the UI part of the application
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Reviews</h3>

      {loading && <p className="mt-2">Loading reviews...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="mt-2">No reviews yet for this event!</p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <ul className="mt-3 space-y-3">
          {reviews.map((rev) => {
            const ownerId = rev.userId ?? rev.user?.id;
            const isOwner = user?.id && ownerId === user.id;

            return (
              <li
                key={rev.id}
                className="rounded-lg border border-gray-300 bg-white p-3"
              >
                <div className="font-semibold">
                  {rev.user?.name || "Anonymous"} – {rev.rating}/5
                </div>

                {rev.comment && (
                  <div className="mt-1 text-sm">{rev.comment}</div>
                )}

                {(isAdmin || isOwner) && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
