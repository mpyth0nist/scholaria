import axios from 'axios'

let baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/'
if (!baseURL.endsWith('/')) {
    baseURL += '/'
}

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
})

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
                // The refresh cookie is sent automatically
                const res = await axios.post(`${api.defaults.baseURL}api/users/refresh/`, {}, {
                    withCredentials: true,
                    xsrfCookieName: 'csrftoken',
                    xsrfHeaderName: 'X-CSRFToken'
                })
                
                if (res.status === 200) {
                    // Retry the original request (the new access cookie is automatically included)
                    return api(originalRequest)
                }
            } catch (err) {
                // If refresh token is expired or invalid, redirect to login
                window.location.href = '/login'
            }
        }
        
        return Promise.reject(error)
    }
)

export default api;