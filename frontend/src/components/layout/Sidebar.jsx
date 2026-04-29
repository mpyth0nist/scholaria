import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavButton = ({ label, isActive, onClick, children }) => (
    <div className="flex flex-col">
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden w-full text-left px-4 py-3 rounded-md text-sm font-bold tracking-widest uppercase transition-all duration-200 z-10 group
                ${isActive
                    ? 'text-white shadow-md bg-primary'
                    : 'text-text hover:text-white'}
            `}
        >
            <span className="relative z-20">{label}</span>
            <div className={`absolute inset-0 bg-primary transform origin-left transition-transform duration-300 -z-10 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
        </button>
        {isActive && children && (
            <div className="ml-3 mt-2 flex flex-col gap-2 border-l-2 border-primary/30 pl-3">
                {children}
            </div>
        )}
    </div>
);

const SubNavButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="text-left text-sm font-bold text-primary hover:text-action py-2 px-3 rounded hover:bg-primary/10 transition-colors tracking-wide uppercase"
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
        <div className="h-full bg-background flex flex-col px-4 py-6 gap-3 border-r border-primary/20 shadow-sm">
            {/* Brand */}
            <div className="mb-4 px-2">
                <span className="text-primary font-serif text-lg font-bold tracking-[0.2em] uppercase">Scholaria</span>
                <div className="h-px bg-primary/20 mt-3" />
            </div>

            {isTeacher ? (
                <>
                    <NavButton
                        label="Dashboard"
                        isActive={location.pathname === '/dashboard'}
                        onClick={() => navigate('/dashboard')}
                    />

                    <NavButton
                        label="Courses"
                        isActive={activeMenu === 'CoursesMenu'}
                        onClick={() => toggle('CoursesMenu')}
                    >
                        <SubNavButton label="All Courses" onClick={() => navigate('/all-courses/')} />
                        <SubNavButton label="Create Course" onClick={() => navigate('/create-course/')} />
                    </NavButton>

                    <NavButton
                        label="Quizzes"
                        isActive={activeMenu === 'QuizzesMenu'}
                        onClick={() => toggle('QuizzesMenu')}
                    >
                        <SubNavButton label="All Quizzes" onClick={() => navigate('/quizzes/list-quizzes/')} />
                        <SubNavButton label="Create Quiz" onClick={() => navigate('/quizzes/create-quiz/')} />
                    </NavButton>

                    <NavButton
                        label="Students"
                        isActive={location.pathname === '/students/'}
                        onClick={() => navigate('/students/')}
                    />
                </>
            ) : isAdmin ? (
                <>
                    <NavButton
                        label="Manage Users"
                        isActive={location.pathname === '/admin/dashboard' || location.pathname === '/dashboard'}
                        onClick={() => navigate('/admin/dashboard')}
                    />
                </>
            ) : (
                <>
                    <NavButton
                        label="Courses"
                        isActive={location.pathname === '/all-courses/'}
                        onClick={() => navigate('/all-courses/')}
                    />
                    <NavButton
                        label="Quizzes"
                        isActive={false}
                        onClick={() => navigate('/quizzes/list-quizzes/')}
                    />
                </>
            )}
        </div>
    );
};

export default Sidebar;