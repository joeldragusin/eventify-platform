import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";

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
    <div style={{ padding: 24 }}>
      <h1 style={{ padding: 24, fontWeight: "bold" }}>Venues</h1>

      {/*The form to CREATE a VENUE only as ADMIN or EVENT_PLANNER*/}
      {canCreate && (
        <div
          style={{
            marginTop: 14,
            border: "1px solid #ccc",
            padding: 12,
            borderRadius: 8,
            maxWidth: 520,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create Venue</h3>
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
              <label>Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </button>

            {formError && (
              <p style={{ color: "red", marginTop: 14 }}>{formError}</p>
            )}
          </form>
        </div>
      )}

      {/*The form to LIST a VENUE*/}
      {loading && <p style={{ marginTop: 14 }}>Loading venues...</p>}
      {error && <p style={{ color: "red", marginTop: 14 }}>{error}</p>}

      {!loading && !error && venues.length === 0 && (
        <p style={{ marginTop: 14 }}>No Venues available yet.</p>
      )}

      {!loading && !error && venues.length > 0 && (
        <ul style={{ marginTop: 16, padding: 0, listStyle: "none" }}>
          {venues.map((v) => (
            <li
              key={v.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: "bold" }}>{v.name}</div>
              <div style={{ marginTop: 6 }}>{v.address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
