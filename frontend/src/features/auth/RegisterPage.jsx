import api from "../../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-md px-4 py-10">
        <Link to="/" className="text-sm text-slate-700 hover:underline dark:text-slate-300">
          Back to Homepage
        </Link>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Register
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Create an account to place orders and leave reviews.
        </p>

        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Alexandru Popescu"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </p>
            )}

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-slate-900 underline dark:text-slate-100"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
