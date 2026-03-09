import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ai-interviewer-app-pfe6.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
