import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../../api/axios.js";
import { loginSuccess, logout } from "./authSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  const [done, setDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMe() {
      try {
        const res = await api.get("/auth/me");
        const user = res.data?.user;

        if (user) {
          dispatch(loginSuccess(user));
        } else {
          dispatch(logout());
        }
      } catch (err) {
        console.log("loadMe error: ", err);
        dispatch(logout());
      } finally {
        if (isMounted) setDone(true);
      }
    }

    loadMe();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
}
