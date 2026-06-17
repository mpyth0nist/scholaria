import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavButton = ({ label, icon, isActive, onClick, children }) => (
    <div className="flex flex-col">
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden w-full text-left px-4 py-2.5 rounded-md text-xs font-bold tracking-widest uppercase transition-all duration-200 z-10 group flex items-center gap-2.5
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
        className="text-left text-xs font-semibold text-text/60 hover:text-action py-1.5 px-3 rounded hover:bg-primary/5 transition-colors tracking-wide uppercase"
    >
        {label}
    </button>
);

const Sidebar = (props) => {
    const isTeacher = (props.role?.toUpperCase() === 'TEACHER')
    const isAdmin = (props.role?.toUpperCase() === 'ADMIN')
    const [activeMenu, setActiveMenu] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    const toggle = (menu) => setActiveMenu(prev => prev === menu ? null : menu)

    return (
        <div className="h-full bg-background flex flex-col px-3 py-5 border-r border-primary/20 shadow-sm">
            {/* Brand */}
            <div className="mb-5 px-2">
                <span className="text-primary font-serif text-lg font-bold tracking-[0.2em] uppercase">Scholaria</span>
                <div className="h-px bg-primary/15 mt-3" />
            </div>

            {/* Nav section label */}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 px-3 mb-2">Navigation</p>

            <div className="flex flex-col gap-1 flex-1">
                {isTeacher ? (
                    <>
                        <NavButton
                            label="Home"
                            icon="🏠"
                            isActive={location.pathname === '/dashboard'}
                            onClick={() => navigate('/dashboard')}
                        />

                        <NavButton
                            label="Courses"
                            icon="📚"
                            isActive={activeMenu === 'CoursesMenu'}
                            onClick={() => toggle('CoursesMenu')}
                        >
                            <SubNavButton label="All Courses" onClick={() => navigate('/all-courses/')} />
                            <SubNavButton label="Create Course" onClick={() => navigate('/create-course/')} />
                        </NavButton>

                        <NavButton
                            label="Quizzes"
                            icon="📝"
                            isActive={activeMenu === 'QuizzesMenu'}
                            onClick={() => toggle('QuizzesMenu')}
                        >
                            <SubNavButton label="All Quizzes" onClick={() => navigate('/quizzes/list-quizzes/')} />
                            <SubNavButton label="Create Quiz" onClick={() => navigate('/quizzes/create-quiz/')} />
                        </NavButton>

                        <NavButton
                            label="Students"
                            icon="👥"
                            isActive={location.pathname === '/students/'}
                            onClick={() => navigate('/students/')}
                        />
                    </>
                ) : isAdmin ? (
                    <>
                        <NavButton
                            label="Home"
                            icon="🏠"
                            isActive={location.pathname === '/admin/dashboard' || location.pathname === '/dashboard'}
                            onClick={() => navigate('/admin/dashboard')}
                        />
                        <NavButton
                            label="Manage Users"
                            icon="⚙️"
                            isActive={false}
                            onClick={() => navigate('/admin/dashboard')}
                        />
                    </>
                ) : (
                    <>
                        <NavButton
                            label="Home"
                            icon="🏠"
                            isActive={location.pathname === '/dashboard'}
                            onClick={() => navigate('/dashboard')}
                        />
                        <NavButton
                            label="Courses"
                            icon="📚"
                            isActive={location.pathname === '/all-courses/'}
                            onClick={() => navigate('/all-courses/')}
                        />
                        <NavButton
                            label="Quizzes"
                            icon="📝"
                            isActive={location.pathname.startsWith('/quizzes')}
                            onClick={() => navigate('/quizzes/list-quizzes/')}
                        />
                    </>
                )}
            </div>

            {/* Bottom brand footer */}
            <div className="px-3 pt-4 border-t border-primary/10">
                <p className="text-[10px] text-primary/30 font-medium tracking-widest uppercase">v1.0 · Scholaria</p>
            </div>
        </div>
    );
};

export default Sidebar;