import AppRouter from "./routes/AppRouter.jsx";
import AuthBootstrap from "./auth/AuthBootstrap.jsx";

export default function App() {
  return (
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
  );
}
