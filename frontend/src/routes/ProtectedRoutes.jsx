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
        } catch (error) {
            setisAuthorized(false)
        }
    }

    if (isAuthorized === null){
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-2 border-action border-t-transparent animate-spin" />
                    <p className="text-primary text-sm font-medium">Loading…</p>
                </div>
            </div>
        )
    }

    return isAuthorized ? <Outlet /> : <Navigate to='/login' />;
}

export default ProtectedRoutes;