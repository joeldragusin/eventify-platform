import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireRole({ roles = [], redirectTo = "/" }) {
  //userul curent (setat prin loginSuccess/AuthBootstrap)
  const user = useSelector((state) => state.auth.user);

  const role = user?.role;

  //daca nu exista user sau nu are rol valid -> redirect
  if (!role) {
    return <Navigate to={redirectTo} replace />;
  }

  //daca rolul nu e in lista permisa -> redirect
  const allowed = roles.includes(role);
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  //daca e ok -> lasa ruta sa se afiseze
  return <Outlet />;
}
