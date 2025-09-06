

import '../../style/style.css'
import TeacherDashboard from '../../pages/TeacherDashboard';
import StudentDashboard from '../../pages/StudentDashboard'
import Sidebar from '../layout/Sidebar'
import {useState, useEffect} from 'react'

import api from '../../api'
function Dashboard( {children} ){
    
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState('')

    const getUserInfo = async () => {
        const res = await api.get('api/users/user/')
        setFirstName(res.data.first_name)
        setLastName(res.data.last_name)
        setRole(res.data.role)
    }

    useEffect(()=>{
        getUserInfo()
    }, [])

    return (
        <>
            <div className="grid grid-rows-[100px_1fr] grid-cols-1 gap-[2rem]">
                <div className="flex items-center relative w-full border-b-[2px] border-violet-500">
                    <div className="flex flex-row absolute right-[1%] gap-[1rem]">
                        <div className="border-2 w-16 h-16 rounded-full">
                            <div className="notification-badge"></div>
                        </div>
                        <div className="border-2 w-16 h-16 rounded-full"> </div>
                    </div>
                </div>
                <div className="grid grid-cols-[300px_1fr]">
                    <Sidebar role={role}/>
                    {children}
                </div>

            </div>
        </>
    )
}

export default Dashboard;