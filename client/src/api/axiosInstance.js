import axios from 'axios'

// Create an Axios instance pointing at the backend API
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    withCredentials: true, // Send httpOnly cookie with every request
    headers: {
        'Content-Type': 'application/json',
    },
})

// Response interceptor: handle 401 globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optionally clear local Redux state or redirect
            // We just reject the promise so slices can handle it
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
