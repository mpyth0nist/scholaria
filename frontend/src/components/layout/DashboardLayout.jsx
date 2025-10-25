

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

    return( 
    
        <div className="min-h-screen bg-[#1a1a1a]">
            <div className="grid grid-rows-[auto_1fr] grid-cols-1">
                {/* Dark Header */}
                <header className="bg-[#242424] border-b border-[#2f2f2f]">
                    <div className="flex items-center justify-between h-16 px-6">
                        {/* Welcome Message */}
                        <div className="text-gray-300">
                            <span className="text-sm font-medium">
                                Welcome back, {firstName}
                            </span>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
                            </button>

                            {/* User Profile */}
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#2f2f2f] transition-colors">
                                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                                    <span className="text-white font-medium text-xs">
                                        {firstName.charAt(0)}{lastName.charAt(0)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-300 capitalize">
                                    {role}
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="grid grid-cols-[260px_1fr]">
                    <Sidebar role={role}/>
                    <main className="p-6 overflow-auto">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;