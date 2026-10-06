import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Ubah 127.0.0.1 menjadi localhost
  headers: {
    'Content-Type': 'application/json',
  },
});

// Otomatis tempelkan Token JWT ke setiap request API
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