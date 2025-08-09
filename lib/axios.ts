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

// Response interceptor for auto-refresh
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
let requestQueue: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string | null> {
    try {
        const { data } = await api.post('/auth/refresh')
        const newToken = data?.data?.token || data?.data?.accessToken
        if (newToken) {
            localStorage.setItem('token', newToken)
            return newToken
        }
        return null
    } catch {
        return null
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const status = error.response?.status

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            if (!isRefreshing) {
                isRefreshing = true
                refreshPromise = refreshAccessToken().finally(() => {
                    isRefreshing = false
                })
            }

            const newToken = await refreshPromise
            if (!newToken) {
                localStorage.removeItem('token')
                return Promise.reject(error)
            }

            // Retry queued requests
            requestQueue.forEach(fn => fn(newToken))
            requestQueue = []

            // Update header and retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api.request(originalRequest)
        }

        // If refresh is in progress, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                requestQueue.push((token) => {
                    if (!token) {
                        reject(error)
                        return
                    }
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    resolve(api.request(originalRequest))
                })
            })
        }

        return Promise.reject(error)
    }
)

export default api
