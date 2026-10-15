import axios from 'axios';

const api = axios.create({
  // Arahkan langsung ke IP laptop kawan kamu yang jalanin Go
  baseURL: 'http://192.168.69.139:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;