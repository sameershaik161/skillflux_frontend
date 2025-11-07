import axios from "axios";

// Create base Axios instance
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
console.log("🔧 Axios Base URL:", baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token attached to request");
    } else {
      console.log("⚠️ No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
