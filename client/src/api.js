// src/api.js
import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
  withCredentials: true, // if your backend uses cookies (optional)
});

// ✅ Automatically attach JWT token from localStorage to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // token saved after login or OTP verification
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
