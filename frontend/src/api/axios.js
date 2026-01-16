import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, //necesar pentru cookie authentication
});

export default api;
