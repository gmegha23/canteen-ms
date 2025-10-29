// client/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend server URL
  withCredentials: true, // include cookies if needed
});

// ✅ Automatically attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // saved during login
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
