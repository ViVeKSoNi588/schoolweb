// API Configuration
// In production (Vercel), API is on same domain at /api
// In development, use localhost:5000
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export default API_URL;
