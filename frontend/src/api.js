import axios from 'axios'

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/'
if (!baseURL.endsWith('/')) {
    baseURL += '/'
}

// Helper to read a cookie by name
function getCookie(name) {
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
})

// ── Request interceptor: inject CSRF token on every mutating request ─────────
api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase()
    if (method && !['get', 'head', 'options'].includes(method)) {
        const csrfToken = getCookie('csrftoken')
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken
        }
    }
    return config
})

// ── Response interceptor: auto-refresh expired access tokens ─────────────────
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
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
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