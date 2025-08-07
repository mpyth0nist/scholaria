import { useState, useEffect } from 'react'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'
import { jwtDecode } from 'jwt-decode'
import api from '../api.js'
import { Outlet, Navigate } from 'react-router-dom'

function ProtectedRoutes(){

    const [isAuthorized, setisAuthorized] = useState(null)

    useEffect(() => {
        auth().catch(() => setisAuthorized(false))
        const interval = setInterval(() => {
            auth().catch(() => setisAuthorized(false))
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)

        try {
            const res = await api.post('api/users/refresh/', {
            refresh : refreshToken
            })
                                
            if ( res.status === 200 ) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setisAuthorized(true)           
            }
            else{
                setisAuthorized(false)
            }

        } catch(error){
            setisAuthorized(false)
        }
       

    }
    
    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        console.log("auth called")
        if (!token){
            setisAuthorized(false)
            return
        }

        const decoded = jwtDecode(token)
        const expired = ( decoded.exp < (Date.now() / 1000) )

        if (expired){
            await refreshToken()
        } else {
            setisAuthorized(true)

        }
    }

    if (isAuthorized === null){
        return <div>...Loading</div>
    }


    return isAuthorized ? <Outlet /> : <Navigate to='/login' />;
}


export default ProtectedRoutes;