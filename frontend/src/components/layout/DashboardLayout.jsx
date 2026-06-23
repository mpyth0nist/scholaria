import '../../style/style.css'
import Sidebar from '../layout/Sidebar'
import LogoutButton from '../LogoutButton'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../../features/users/userSlice'
import { useLocation } from 'react-router-dom'

function Dashboard({ children }) {

    const dispatch = useDispatch()
    const user = useSelector(state => state.users.user)
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchUser())
    }, [])

    useEffect(() => {
        setSidebarOpen(false)
    }, [location])

    const firstName = user?.first_name ?? ''
    const lastName = user?.last_name ?? ''
    const role = user?.role ?? ''

    return (
        <div className="h-screen w-screen bg-background p-2 overflow-hidden flex flex-col">
            <div className="h-full border border-primary/20 rounded-lg overflow-hidden flex flex-col shadow-sm">

                {/* ── Main Content ── */}
                <div className="flex-1 flex flex-col md:grid md:grid-cols-[240px_1fr] relative overflow-hidden">
                    {/* Floating Hamburger Toggle Button on Mobile */}
                    <button
                        onClick={() => setSidebarOpen(prev => !prev)}
                        className="fixed top-5 left-5 z-40 p-2.5 rounded-lg bg-background/80 backdrop-blur-md border border-primary/20 hover:bg-primary/10 md:hidden flex items-center justify-center text-text cursor-pointer transition-colors shadow-sm"
                        aria-label="Toggle navigation menu"
                    >
                        <span className="text-xl leading-none">☰</span>
                    </button>

                    {/* Sidebar wrapper */}
                    <div className={`
                        fixed inset-y-0 left-0 z-50 w-[240px] bg-background transform transition-transform duration-300 ease-in-out
                        md:static md:translate-x-0 md:h-full md:w-auto
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <Sidebar role={role} />
                    </div>

                    {/* Sidebar mobile overlay backdrop */}
                    {sidebarOpen && (
                        <div 
                            onClick={() => setSidebarOpen(false)} 
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                    )}

                    <main className="bg-background p-4 pt-16 md:pt-6 md:p-6 overflow-y-auto flex-1 h-full">
                        <div className="max-w-7xl mx-auto pb-8">
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