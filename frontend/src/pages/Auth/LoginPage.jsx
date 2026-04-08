import { useState } from 'react'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants.js'
import '../../style/style.css'
import api from '../../api.js'
import { useNavigate } from 'react-router-dom'


function LoginPage() {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        const res = await api.post('/api/users/token/', { username, password })
        if (res.status === 200) {
            localStorage.setItem(ACCESS_TOKEN, res.data.access)
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="bg-[#e0e0e0] rounded-3xl px-8 py-10 w-[340px] flex flex-col gap-5 shadow-2xl">

                <h2 className="text-[#111] text-2xl font-extrabold text-center tracking-tight">
                    Welcome to Scholaria!
                </h2>

                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <input
                        className="bg-[#111] text-white placeholder-gray-400 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-600 transition"
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        value={username}
                        placeholder="Username"
                    />
                    <input
                        className="bg-[#111] text-white placeholder-gray-400 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-600 transition"
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        value={password}
                        placeholder="Password"
                    />
                    <button
                        type="submit"
                        className="bg-[#111] text-white rounded-full px-5 py-3 text-sm font-semibold mt-1 hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;