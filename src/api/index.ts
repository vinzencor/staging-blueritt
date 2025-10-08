import axios from "axios";

// Get the base URL from environment variables
const baseUrl = import.meta.env.VITE_API_URL;

// Create the axios instance
const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,  // Ensure credentials (like cookies) are included
  headers: {
    'ngrok-skip-browser-warning': 'true',  // Skip the Ngrok browser warning page
    'Access-Control-Allow-Origin': 'https://staging-blueritt.vercel.app/',  // Allow the specific origin
  },
});

// Example of setting the origin dynamically if needed:
const allowedOrigins = ['https://staging-blueritt.vercel.app/', 'https://staging-blueritt.vercel.app/'];

if (allowedOrigins.includes(window.location.origin)) {
  api.defaults.headers['Access-Control-Allow-Origin'] = window.location.origin;
}

export default api;
