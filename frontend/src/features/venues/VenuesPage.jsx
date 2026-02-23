import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function VenuesPage() {
  //we define the state for listing Venues
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //we define the authentication to see if the form is shown based on role
  const user = useSelector((state) => state.auth.user);
  const canCreate = user?.role === "ADMIN" || user?.role === "EVENT_PLANNER";

  //we define the state for creating a Venue
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  //load Venues: GET /api/venues
  async function loadVenues() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/venues");
      setVenues(res.data.venues || []);
    } catch (err) {
      console.log("loadVenues error: ", err);
      setError("Can't load Venues.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVenues();
  }, []);

  //create Venues: POST /api/venues
  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");

    //we validate name and address have been introduced by using the function trim() on strings
    if (!name.trim() || !address.trim()) {
      setFormError("Both name and address are required!");
      return;
    }

    try {
      setSaving(true);

      await api.post("/venues", { name: name.trim(), address: address.trim() });

      //we now reset the form to the initial stage, when is empty and ready to be used again
      setName("");
      setAddress("");

      //now that we created a new Venue in the DB, we also need to refresh the list
      await loadVenues();
    } catch (err) {
      console.log("handleCreate: ", err);
      const msg =
        err?.response?.data?.error || "Can't create a Venue right now.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* top bar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Venues</h1>
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            Back to Homepage
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/*The form to CREATE a VENUE only as ADMIN or EVENT_PLANNER*/}
        {canCreate && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Create Venue
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
                  Address <span className="text-red-600">*</span>
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
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

        {/*The form to LIST a VENUE*/}
        <div className="mt-6">
          {loading && <p className="text-slate-600">Loading venues...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && venues.length === 0 && (
            <p className="text-slate-600">No Venues available yet.</p>
          )}

          {!loading && !error && venues.length > 0 && (
            <ul className="grid gap-3">
              {venues.map((v) => (
                <li
                  key={v.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="font-semibold text-slate-900">{v.name}</div>
                  <div className="mt-2 text-slate-700">{v.address}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
