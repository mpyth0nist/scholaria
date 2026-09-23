import { useState, useEffect } from 'react'
import '../../style/style.css'
import api from '../../api.js'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../features/users/userSlice'

function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Ensure Redux state is wiped clean when landing on the login page
    useEffect(() => {
        dispatch(logout())
    }, [dispatch])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await api.post('/api/users/token/', { username, password })
            if (res.status === 200) {
                navigate('/dashboard')
            }
        } catch (err) {
            // Parse Django/DRF error shapes gracefully
            const data = err.response?.data
            if (data?.detail) {
                setError(data.detail)
            } else if (data?.non_field_errors) {
                setError(data.non_field_errors[0])
            } else if (err.response?.status === 401) {
                setError('Invalid username or password.')
            } else if (!err.response) {
                setError('Unable to reach the server. Please check your connection.')
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="premium-card px-8 py-10 w-full max-w-[340px] flex flex-col gap-5">

                <h2 className="text-text text-2xl font-serif font-extrabold text-center tracking-tight">
                    Welcome to Scholaria!
                </h2>

                {error && (
                    <div className="bg-red-100/80 border border-red-400 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <input
                        className="premium-input w-full"
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        value={username}
                        placeholder="Username"
                        disabled={loading}
                        autoComplete="username"
                    />
                    <input
                        className="premium-input w-full"
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        value={password}
                        placeholder="Password"
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-action text-white rounded-full px-5 py-3 text-sm font-semibold mt-1 hover:bg-[#a04618] btn-press cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {loading ? 'Signing in…' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;