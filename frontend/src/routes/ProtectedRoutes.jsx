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
        return <div>...Loading</div>
    }

    return isAuthorized ? <Outlet /> : <Navigate to='/login' />;
}

export default ProtectedRoutes;