import { Link } from "react-router-dom";

// Shown instead of a form when the user is not logged in.
export default function LoginButton({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        {message || "You need to be logged in to perform this action."}
      </p>

      <Link
        to="/login"
        className="mt-3 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Login
      </Link>
    </div>
  );
}
