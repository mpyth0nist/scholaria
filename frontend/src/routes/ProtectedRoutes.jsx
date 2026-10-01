import { useState, useEffect } from 'react'
import api from '../api.js'
import { Outlet, Navigate } from 'react-router-dom'

function ProtectedRoutes(){

    const [isAuthorized, setisAuthorized] = useState(null)

    useEffect(() => {
        auth().catch(() => setisAuthorized(false))
    }, [])

    const auth = async () => {
        try {
            const res = await api.get('api/users/user/')
            if (res.status === 200) {
                setisAuthorized(true)
            } else {
                setisAuthorized(false)
            }
        } catch {
            setisAuthorized(false)
        }
    }

    if (isAuthorized === null){
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-primary/60 text-sm font-medium tracking-wide">Loading…</p>
                </div>
            </div>
        )
    }

    return isAuthorized ? <Outlet /> : <Navigate to='/login' />;
}

export default ProtectedRoutes;