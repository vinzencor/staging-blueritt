import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,       // include cookies
  // DO NOT set any Access-Control-* headers here
});

export default api;
