import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-slate-50">
      {/* top bar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Testimonials</h1>
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            Back to Homepage
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/*Here is defined the Testimonial creation only for ADMIN*/}
        {isAdmin && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Create Testimonial (Admin)
            </h3>

            <form onSubmit={handleCreate} className="mt-4 grid gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Role label (optional)
                </label>
                <input
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Rating (1...5 optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create"}
                </button>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}
              </div>
            </form>
          </div>
        )}

        {/*Here is defined listing of Testimonials*/}
        <div className="mt-6">
          {loading && <p className="text-slate-600">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && testimonials.length === 0 && (
            <p className="text-slate-600">No testimonials yet.</p>
          )}

          {!loading && !error && testimonials.length > 0 && (
            <ul className="grid gap-3">
              {testimonials.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {t.name}{" "}
                        {t.roleLabel ? (
                          <span className="font-normal text-slate-500">
                            — {t.roleLabel}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 text-slate-700">{t.message}</div>

                      {t.rating !== null && t.rating !== undefined && (
                        <div className="mt-2 text-sm text-slate-600">
                          Rating: <span>{t.rating}</span>/5
                        </div>
                      )}
                    </div>

                    {/*Here is defined delete Testimonial only as ADMIN*/}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
