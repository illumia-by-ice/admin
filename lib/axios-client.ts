import axios from "axios";

// Create an Axios client instance with a base URL
const api = axios.create({
  baseURL: "https://api.illumiacityempire.com",
  // baseURL: "http://localhost:7000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    const token = localStorage.getItem("@aje-auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh or other error handling logic here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        "Response error:",
        error.response.status,
        error.response.data
      );

      // Handle 401 Unauthorized errors - you might want to redirect to login
      if (error.response.status === 401 && !originalRequest._retry) {
        // Add your token refresh logic here if needed
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
