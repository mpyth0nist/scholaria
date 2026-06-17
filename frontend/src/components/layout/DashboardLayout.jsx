import '../../style/style.css'
import Sidebar from '../layout/Sidebar'
import LogoutButton from '../LogoutButton'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../../features/users/userSlice'
import { useLocation } from 'react-router-dom'

function Dashboard({ children }) {

    const dispatch = useDispatch()
    const user = useSelector(state => state.users.user)
    const location = useLocation()

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
                            {/* key forces re-mount on route change, triggering the CSS animation */}
                            <div key={location.pathname} className="animate-page-enter">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Dashboard