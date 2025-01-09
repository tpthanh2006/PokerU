import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',  // Update this URL for production
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 