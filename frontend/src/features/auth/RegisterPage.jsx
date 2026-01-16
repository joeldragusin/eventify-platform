import api from "../../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();

  //user credentials input state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  //loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    //after entering user's credentials, we stop the page refresh to not lose them
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: name,
        email: email,
        password: pwd,
      });

      //after successfully registering, redirect to login page
      nav("/login");
    } catch (err) {
      console.log("Error: ", err);
      const msg = err?.response?.data?.error || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Register</h1>

      <form onSubmit={handleRegister} style={{ maxWidth: 360 }}>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />

        <label>Password</label>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      </form>
    </div>
  );
}
