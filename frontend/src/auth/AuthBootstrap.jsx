import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../api/axios.js";
import { loginSuccess, logout } from "../features/auth/authSlice.js";

//AuthBootstrap acts like a "restore the session" mechanism
//usually after a page/browser refresh, Redux loses all the information stored until that moment, despite the cookie bain saved in the browser
//but AuthBootstrap will help "store" it very time, so once logged you stay logged
export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  //strictyl as UX, I have set a state  to simply output "Loading.."
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      try {
        //we obtain from the backend a confirmation the authenticated user is the current one
        const res = await api.get("/auth/me");

        //if the user is returned from the backend (aka it is logged in)
        if (res.data?.user) {
          dispatch(loginSuccess(res.data.user));
        } else {
          dispatch(logout());
        }
      } catch (err) {
        console.log("boot error: ", err);
        dispatch(logout());
      } finally {
        if (isMounted) setBootstrapping(false);
      }
    }

    boot();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (bootstrapping) {
    return <p style={{ padding: 24 }}>Checking session...</p>;
  }

  //after the authentication restore the app is rendered as usual
  return children;
}
