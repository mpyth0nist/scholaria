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
        <div className="border-2 rounded-sm">
            <form className="flex flex-col gap-4 p-4  " onSubmit={handleLogin}>

                <h2>Welcome back!</h2>
                <h3>Log In</h3>
                <input className="border-1 p-2 rounded-sm" onChange={(e) => setUsername(e.target.value)} type="text" value={username} placeholder="Username" />
                <input className="border-1 p-2 rounded-sm" onChange={(e) => setPassword(e.target.value)} type="password" value={password} placeholder="Password" />
                <input className="border-1 p-2 rounded-sm" type="submit" />
            </form>
        </div>
    )
}

export default LoginPage;