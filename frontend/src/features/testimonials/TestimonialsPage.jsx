import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";

export default function TestimonialsPage() {
  //list the testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //checking for ADMIN role
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  //create a form (as ADMIN only), representing the input values in the testimonial form
  const [name, setName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("");

  //saving disables the button against a double-click, while formError shows the error of the form if it is the case
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  //we list the testimonials from the backend using axios.js
  async function loadTestimonials() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/testimonials");
      setTestimonials(res.data.testimonials || []);
    } catch (err) {
      console.log("loadTestimonials error: ", err);
      setError("Can't load testimonials, sorry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");

    //validation similar to the one in backend. we check the name and message were introduced
    if (!name.trim() || !message.trim()) {
      setFormError("Name and message are required!");
      return;
    }

    //I make sure the rating, although optional, is between 1 and 5 stars
    let ratingNum = null;

    if (rating !== "" && rating !== null && rating !== undefined) {
      ratingNum = Number(rating);
      if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        setFormError("Rating must be a number between 1 and 5.");
        return;
      }
    }

    try {
      setSaving(true);

      await api.post("/testimonials", {
        name: name.trim(),
        roleLabel: roleLabel.trim() || null,
        message: message.trim(),
        rating: ratingNum,
      });

      //once the testimonials written, we reset the form aka we clean it
      setName("");
      setRoleLabel("");
      setMessage("");
      setRating("");

      //now we reload the list of testimonials so we see the latest created one
      await loadTestimonials();
    } catch (err) {
      console.log("handleCreate error: ", err);
      const msg =
        err?.response?.data?.error ||
        "Can't create testimonial right now, sorry.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(testimonialId) {
    const ok = window.confirm("Delete this testimonial?");
    if (!ok) return;

    try {
      await api.delete(`/testimonials/${testimonialId}`);
      await loadTestimonials();
    } catch (err) {
      console.log("handleDelete: ", err);
      const msg =
        err?.response?.data?.error || "Delete testimonial failed. Sorry buddy.";
      alert(msg);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Testimonials</h1>

      {/*Here is defined the Testimonial creation only for ADMIN*/}
      {isAdmin && (
        <div
          style={{
            marginTop: 14,
            border: "1px solid #ccc",
            padding: 12,
            borderRadius: 8,
            maxWidth: 520,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create Testimonial (Admin)</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 10 }}>
              <label>Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Role label (optional)</label>
              <input
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Message *</label>
              <input
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Rating (1...5 optional)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </button>

            {formError && (
              <p style={{ color: "red", marginTop: 10 }}>{formError}</p>
            )}
          </form>
        </div>
      )}

      {/*Here is defined listing of Testimonials*/}
      {loading && <p style={{ marginTop: 14 }}>Loading...</p>}
      {error && <p style={{ color: "red", marginTop: 14 }}>{error}</p>}

      {!loading && !error && testimonials.length === 0 && (
        <p style={{ marginTop: 14 }}>No testimonials yet.</p>
      )}

      {!loading && !error && testimonials.length > 0 && (
        <ul style={{ marginTop: 16, padding: 0, listStyle: "none" }}>
          {testimonials.map((t) => (
            <li
              key={t.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {t.name} {t.roleLabel ? `- ${t.roleLabel}` : ""}
              </div>

              <div style={{ marginTop: 6 }}>{t.message}</div>

              {t.rating !== null && t.rating !== undefined && (
                <div style={{ marginTop: 6 }}>Rating: {t.rating}/5</div>
              )}

              {/*Here is defined delete Testimonial only as ADMIN*/}
              {isAdmin && (
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => handleDelete(t.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
