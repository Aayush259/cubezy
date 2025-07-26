import axios from "axios"

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
