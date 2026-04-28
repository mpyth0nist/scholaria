import '../../style/style.css'
import Sidebar from '../layout/Sidebar'
import LogoutButton from '../LogoutButton'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../../features/users/userSlice'

function Dashboard({ children }) {

    const dispatch = useDispatch()
    const user = useSelector(state => state.users.user)

    useEffect(() => {
        dispatch(fetchUser())
    }, [])

    const firstName = user?.first_name ?? ''
    const lastName = user?.last_name ?? ''
    const role = user?.role ?? ''

    return (
        <div className="min-h-screen bg-background p-2">
            <div className="min-h-[calc(100vh-1rem)] border border-primary/20 rounded-lg overflow-hidden flex flex-col shadow-sm">

                {/* ── Header ── */}
                <header className="bg-background border-b border-primary/20">
                    <div className="flex items-center justify-between h-16 px-6">

                        {/* Welcome message */}
                        <div className="text-text">
                            <span className="text-sm font-medium">
                                Welcome back, {firstName}
                            </span>
                        </div>

                        {/* Header actions */}
                        <div className="flex items-center gap-3">

                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-action rounded-full" />
                            </button>

                            {/* User avatar + role */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                                    <span className="text-primary font-bold text-xs">
                                        {firstName.charAt(0)}{lastName.charAt(0)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-text capitalize">
                                    {role}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-6 bg-primary/20" />

                            {/* Logout */}
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <div className="grid grid-cols-[240px_1fr] flex-1">
                    <Sidebar role={role} />
                    <main className="bg-background p-6 overflow-auto min-h-full">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Dashboard