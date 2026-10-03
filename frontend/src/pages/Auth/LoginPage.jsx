import { useState, useEffect } from 'react'
import '../../style/style.css'
import api from '../../api.js'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../features/users/userSlice'

function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-action/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />

            <div className="premium-card px-6 sm:px-8 pt-10 pb-8 w-full max-w-[380px] flex flex-col gap-6 relative z-10 @media(prefers-reduced-motion:no-preference):animate-page-enter">
                
                <div className="flex flex-col items-center gap-3">
                    {/* SVG Logo mark */}
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-[#132A13] shadow-sm border border-accent/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h2 className="text-text text-2xl font-serif font-extrabold tracking-tight">
                            Welcome to Scholaria
                        </h2>
                        <p className="text-muted text-sm mt-1 font-medium text-balance">Log in to continue your learning journey.</p>
                    </div>
                </div>

                {error && (
                    <div role="alert" aria-live="assertive" className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-ui px-4 py-3 text-center font-medium">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="username" className="text-sm font-semibold text-text">Username</label>
                        <input
                            id="username"
                            className="premium-input w-full"
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            value={username}
                            placeholder="Enter your username"
                            disabled={loading}
                            autoComplete="username"
                            required
                            aria-invalid={!!error}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-semibold text-text">Password</label>
                            <a href="#" className="text-xs font-semibold text-text hover:underline transition-colors focus-visible:outline-action rounded">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                className="premium-input w-full pe-10"
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                placeholder="Enter your password"
                                disabled={loading}
                                autoComplete="current-password"
                                required
                                aria-invalid={!!error}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 end-0 flex items-center justify-center w-10 text-text opacity-50 hover:opacity-100 transition-opacity focus-visible:outline-action rounded-e-ui"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !username || !password}
                        className="bg-accent border border-transparent text-[#132A13] rounded-ui px-5 py-3 text-sm font-semibold mt-2 enabled:hover:brightness-95 enabled:active:scale-[0.98] disabled:opacity-50 disabled:bg-surface disabled:border-border disabled:text-muted disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-background"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-[#132A13]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing in…</span>
                            </>
                        ) : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;