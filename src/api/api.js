import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-trailbliss.onrender.com/api',
  withCredentials: true, // sends httpOnly cookie automatically on every request
});

export default api;
