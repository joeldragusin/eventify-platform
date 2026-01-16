import AppRouter from "./routes/AppRouter.jsx";
import AuthBootstrap from "./features/auth/AuthBootstrap.jsx";

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <AppRouter />
    </>
  );
}
