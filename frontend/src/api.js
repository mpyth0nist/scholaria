
import axios from 'axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants'

const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/'
})


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        
        if (token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },

    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config
        
        // If error is 401 and we haven't retried yet, try to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            
            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN)
                if (refreshToken) {
                    // Make a raw axios call to avoid an infinite loop in the interceptor
                    const res = await axios.post(`${api.defaults.baseURL}api/users/refresh/`, {
                        refresh: refreshToken
                    })
                    
                    if (res.status === 200) {
                        localStorage.setItem(ACCESS_TOKEN, res.data.access)
                        originalRequest.headers.Authorization = `Bearer ${res.data.access}`
                        // Retry the original request with the new token
                        return api(originalRequest)
                    }
                }
            } catch (err) {
                // If refresh token is expired or invalid, log the user out
                localStorage.removeItem(ACCESS_TOKEN)
                localStorage.removeItem(REFRESH_TOKEN)
                window.location.href = '/login'
            }
        }
        
        return Promise.reject(error)
    }
)

export default api;