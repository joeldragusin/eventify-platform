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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-slate-700 dark:text-slate-300">
        Logged in as:{" "}
        <b className="font-semibold text-slate-900 dark:text-slate-100">
          {user?.name || user?.email}
        </b>
      </span>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
