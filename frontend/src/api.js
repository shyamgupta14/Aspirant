import axios from 'axios';

// Set this variable in the Vercel Dashboard (e.g., https://your-backend.onrender.com/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Auto-inject token into headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export default api;
export { API_URL };
