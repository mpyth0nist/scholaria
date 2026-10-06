export const BASE_URL = (() => {
    let u = import.meta.env.VITE_API_URL || 'http://localhost:8000/'
    return u.endsWith('/') ? u : u + '/'
})()

export function getCookie(name) {
    if (typeof document === 'undefined' || !document.cookie) return null
    for (const c of document.cookie.split(';')) {
        const t = c.trim()
        if (t.startsWith(name + '=')) {
            return decodeURIComponent(t.slice(name.length + 1))
        }
    }
    return null
}

