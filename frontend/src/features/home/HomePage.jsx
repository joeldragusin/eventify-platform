import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Eventify</h1>
      <p style={{ marginTop: 8 }}>
        Find events, buy tickets and leave a review!
      </p>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link to="/events">Events</Link>
        <Link to="/venues">Venues</Link>
        <Link to="/testimonials">Testimonials</Link>
      </div>
    </div>
  );
}
