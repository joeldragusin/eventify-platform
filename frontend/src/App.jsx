import AppRouter from "./routes/AppRouter.jsx";
import AuthBootstrap from "./auth/AuthBootstrap.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

export default function App() {
  return (
    <AuthBootstrap>
      <AppRouter />
      <ThemeToggle />
    </AuthBootstrap>
  );
}
