import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "../LogoutButton";

const NavButton = ({ label, icon, isActive, onClick, children }) => (
    <div className="flex flex-col">
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden w-full text-left px-4 py-2.5 rounded-md text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 z-10 group flex items-center gap-2.5 font-sans
                ${isActive
                    ? 'text-white shadow-md bg-primary'
                    : 'text-text/70 hover:text-white'}
            `}
        >
            {icon && <span className="text-base leading-none shrink-0 opacity-80">{icon}</span>}
            <span className="relative z-20">{label}</span>
            <div className={`absolute inset-0 bg-primary transform origin-left transition-transform duration-300 -z-10 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
        </button>
        {isActive && children && (
            <div className="ml-3 mt-1.5 flex flex-col gap-1 border-l-2 border-primary/30 pl-3">
                {children}
            </div>
        )}
    </div>
);

const SubNavButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="text-left text-xs font-semibold text-text/60 hover:text-action py-1.5 px-3 rounded hover:bg-primary/5 transition-colors tracking-[0.12em] uppercase font-sans"
    >
        {label}
    </button>
);

const HomeIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const CoursesIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const QuizzesIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const StudentsIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ManageUsersIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

    const toggleTheme = () => {
        const nextDark = !isDark
        setIsDark(nextDark)
        if (nextDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    return (
        <button
            onClick={toggleTheme}
            className="btn-press flex items-center justify-between w-full px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-text/70 hover:text-text transition-colors duration-200 focus:outline-none"
            aria-label="Toggle Theme"
        >
            <div className="flex items-center gap-2.5">
                {isDark ? (
                    <svg className="w-4 h-4 text-action animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-action animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                )}
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] font-sans">
                    {isDark ? 'Dark Theme' : 'Light Theme'}
                </span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-primary/20'}`}>
                <div className={`w-3 h-3 rounded-full bg-background transition-transform duration-300 transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
        </button>
    )
}

const Sidebar = (props) => {
    const user = useSelector(state => state.users.user)
    const role = user?.role ?? props.role ?? ''
    const isTeacher = (role.toUpperCase() === 'TEACHER')
    const isAdmin = (role.toUpperCase() === 'ADMIN')
    const [activeMenu, setActiveMenu] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    const toggle = (menu) => setActiveMenu(prev => prev === menu ? null : menu)

    const firstName = user?.first_name ?? ''
    const lastName = user?.last_name ?? ''

    return (
        <div className="h-full bg-background flex flex-col px-3 py-5 border-r border-primary/20 shadow-sm">
            {/* Brand */}
            <div className="mb-5 px-2">
                <span className="text-primary font-serif text-lg font-bold tracking-[0.2em] uppercase">Scholaria</span>
                <div className="h-px bg-primary/15 mt-3" />
            </div>

            {/* Nav section label */}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 px-3 mb-2 font-sans">Navigation</p>

            <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
                {isTeacher ? (
                    <>
                        <NavButton
                            label="Home"
                            icon={HomeIcon}
                            isActive={location.pathname === '/dashboard'}
                            onClick={() => navigate('/dashboard')}
                        />

                        <NavButton
                            label="Courses"
                            icon={CoursesIcon}
                            isActive={activeMenu === 'CoursesMenu'}
                            onClick={() => toggle('CoursesMenu')}
                        >
                            <SubNavButton label="All Courses" onClick={() => navigate('/all-courses/')} />
                            <SubNavButton label="Create Course" onClick={() => navigate('/create-course/')} />
                        </NavButton>

                        <NavButton
                            label="Quizzes & Assignments"
                            icon={QuizzesIcon}
                            isActive={activeMenu === 'QuizzesMenu'}
                            onClick={() => toggle('QuizzesMenu')}
                        >
                            <SubNavButton label="All Quizzes" onClick={() => navigate('/quizzes/list-quizzes/')} />
                            <SubNavButton label="Create Quiz" onClick={() => navigate('/quizzes/create-quiz/')} />
                            <SubNavButton label="All Assignments" onClick={() => navigate('/assignments/list/')} />
                            <SubNavButton label="Create Assignment" onClick={() => navigate('/assignments/create/')} />
                        </NavButton>

                        <NavButton
                            label="Students"
                            icon={StudentsIcon}
                            isActive={location.pathname === '/students/'}
                            onClick={() => navigate('/students/')}
                        />
                    </>
                ) : isAdmin ? (
                    <>
                        <NavButton
                            label="Home"
                            icon={HomeIcon}
                            isActive={location.pathname === '/admin/dashboard' || location.pathname === '/dashboard'}
                            onClick={() => navigate('/admin/dashboard')}
                        />
                        <NavButton
                            label="Manage Users"
                            icon={ManageUsersIcon}
                            isActive={false}
                            onClick={() => navigate('/admin/dashboard')}
                        />
                    </>
                ) : (
                    <>
                        <NavButton
                            label="Home"
                            icon={HomeIcon}
                            isActive={location.pathname === '/dashboard'}
                            onClick={() => navigate('/dashboard')}
                        />
                        <NavButton
                            label="Courses"
                            icon={CoursesIcon}
                            isActive={location.pathname === '/all-courses/'}
                            onClick={() => navigate('/all-courses/')}
                        />
                        <NavButton
                            label="Quizzes & Assignments"
                            icon={QuizzesIcon}
                            isActive={activeMenu === 'StudentQuizzesMenu'}
                            onClick={() => toggle('StudentQuizzesMenu')}
                        >
                            <SubNavButton label="Quizzes" onClick={() => navigate('/quizzes/list-quizzes/')} />
                            <SubNavButton label="Assignments" onClick={() => navigate('/assignments/list/')} />
                        </NavButton>
                    </>
                )}
            </div>

            {/* User Profile Card & Logout */}
            <div className="mt-auto pt-4 border-t border-primary/15 flex flex-col gap-3">
                <ThemeToggle />
                {user && (
                    <div className="flex items-center gap-2.5 px-2 py-1">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                            <span className="text-primary font-bold text-xs uppercase">
                                {firstName.charAt(0)}{lastName.charAt(0)}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-text truncate">
                                {firstName} {lastName}
                            </span>
                            <span className="text-[10px] font-medium text-text/50 capitalize truncate">
                                {role}
                            </span>
                        </div>
                    </div>
                )}
                
                <LogoutButton className="w-full justify-start text-xs font-bold tracking-[0.15em] uppercase py-2 px-3 hover:bg-red-500/10 text-primary hover:text-red-400 active:scale-95 transition-all font-sans" />
            </div>
        </div>
    );
};

export default Sidebar;