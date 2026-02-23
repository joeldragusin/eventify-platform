import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useState } from "react";
import { logout } from "./authSlice.js";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) return null;

  async function handleLogout() {
    try {
      setLoading(true);

      //first we delete the cookie in the backend
      await api.post("/auth/logout");

      //we then delete the user within Redux
      dispatch(logout());

      //navigate back to the home screen
      navigate("/");
    } catch (err) {
      console.log("logout error: ", err);
      //we also performa UI cleanage even if the backend did not respond
      dispatch(logout());
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontSize: 14 }}>
        Logged in as: <b>{user?.name || user?.email}</b>
      </span>

      <div>
        <button onClick={handleLogout} disabled={loading}>
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
