import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";

export default function ReviewsList({ eventId, refreshKey, onRefresh }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!eventId) return;

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        //backedn API: GET /api/reviews?eventId=7 de exemplu
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

  async function handleDelete(reviewId) {
    const ok = window.confirm("Delete this review?");
    if (!ok) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.log("deleteReview error: ", err);
      const msg = err?.response?.data?.error || "Delete review failed.";
      alert(msg);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: "bold" }}>Reviews</h3>
      {loading && <p>Loading reviews...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p>No reviews yet for this event!</p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <ul style={{ marginTop: 10, padding: 0, listStyle: "none" }}>
          {reviews.map((rev) => {
            const ownerId = rev.userId ?? rev.user?.id;
            const isOwner = user?.id && ownerId === user.id;

            return (
              <li
                key={rev.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {rev.user?.name || "Anonymous"} - {rev.rating}/5
                </div>

                {rev.comment && (
                  <div style={{ marginTop: 6 }}>{rev.comment}</div>
                )}

                {(isAdmin || isOwner) && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => handleDelete(rev.id)}>Delete</button>
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
