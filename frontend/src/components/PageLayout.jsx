import { Link } from "react-router-dom";

// Shared page shell so every screen looks and behaves the same:
// light background, a white top bar (title on the left, back link on the right)
// and a centered, responsive content area.
//
// Props:
//   title     - page heading shown in the top bar
//   backTo    - route for the back link (default "/")
//   backLabel - text of the back link (default "Back to Homepage")
//   actions   - optional element(s) shown next to the back link (e.g. a button)
//   width     - content max width: "md" | "lg" | "xl" (default "lg")
const WIDTHS = {
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function PageLayout({
  title,
  backTo = "/",
  backLabel = "Back to Homepage",
  actions = null,
  width = "lg",
  children,
}) {
  const maxWidth = WIDTHS[width] || WIDTHS.lg;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div
          className={`mx-auto flex ${maxWidth} flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4`}
        >
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>

          <div className="flex items-center gap-3">
            {actions}
            <Link
              to={backTo}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {backLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className={`mx-auto ${maxWidth} px-4 py-6`}>{children}</main>
    </div>
  );
}
