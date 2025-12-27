import axios from "axios";

// Create an Axios instance with default configuration
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true, // Important for cookies
});

// Configure interceptors if needed (e.g., for error handling)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here if needed
        return Promise.reject(error);
    }
);

export default client;
