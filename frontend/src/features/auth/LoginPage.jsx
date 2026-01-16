import api from "../../api/axios.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { loginSuccess } from "./authSlice.js";

export default function LoginPage() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  //we define the user's credentials state
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  //we define the loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(myCredentials) {
    //after entering user's credentials, we stop the page refresh to not lose them
    myCredentials.preventDefault();
    setError("");

    try {
      setLoading(true);

      //login credentials are compared against the already existing ones in the DB
      const res = await api.post("/auth/login", {
        email: email,
        password: pwd,
      });

      //save the user in Redux, by calling loginSuccess from authSlice.js
      dispatch(loginSuccess(res.data.user));

      //after both login is successful AND the backend offers me a token (therefore cookie), we get redirected to Events page
      nav("/events");
    } catch (err) {
      console.log("handleLogin Error: ", err);
      const msg =
        err?.response?.data?.error || "Login failed. Check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Login</h1>
      <form onSubmit={handleLogin} style={{ marginTop: 12, maxWidth: 360 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(myCredentials) => setEmail(myCredentials.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
        />

        <label>Password</label>
        <input
          type="password"
          value={pwd}
          onChange={(myCredentials) => setPwd(myCredentials.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      </form>
    </div>
  );
}
