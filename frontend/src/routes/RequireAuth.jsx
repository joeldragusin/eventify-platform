import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  //luam starea globala din Redux (authSlice.js)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  //retinem unde a vrut userul sa intre ca sa l intoarcem dupa login
  const location = useLocation();

  //daca nu e logat, il trimit la login
  //state={{ from: location }} = "tinem minte pagina ceruta"
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  //daca e logat -> continua catre ruta "din interior"
  return <Outlet />;
}
