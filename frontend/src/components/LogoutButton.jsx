import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'

function LogoutButton({ className = '' }) {

    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        setLoading(true)
        const refresh = localStorage.getItem(REFRESH_TOKEN)

        try {
            // Blacklist the refresh token on the server
            await api.post('api/users/logout/', { refresh })
        } catch (err) {
            // Proceed with client-side logout even if server call fails
            console.error('Logout request failed:', err)
        } finally {
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(REFRESH_TOKEN)
            setLoading(false)
            navigate('/login')
        }
    }

    return (
        <button
            id="logout-btn"
            onClick={handleLogout}
            disabled={loading}
            className={`
                group flex items-center gap-2 px-3 py-1.5 rounded-lg
                text-sm font-medium text-gray-400
                hover:text-red-400 hover:bg-red-500/10
                active:scale-95
                transition-all duration-150 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            title="Sign out"
        >
            {/* Door / logout icon */}
            <svg
                className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
            </svg>

            <span className="hidden sm:inline">
                {loading ? 'Signing out…' : 'Sign out'}
            </span>
        </button>
    )
}

export default LogoutButton
