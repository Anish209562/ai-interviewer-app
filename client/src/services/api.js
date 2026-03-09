import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-interviewer-app-pfe6.onrender.com/api",
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