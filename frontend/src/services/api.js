import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add JWT to headers if exists
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});



export const sendOtp = (mobile) => api.post('/auth/send-otp', { mobile });
export const verifyOtp = (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp });
export const getRideEstimate = (pickup, drop, vehicleType) =>
    api.get(`/ride/estimate`, { params: { ...pickup, ...drop, vehicleType } });

export default api;
