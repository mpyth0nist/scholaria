import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavButton = ({ label, isActive, onClick, children }) => (
    <div className="flex flex-col">
        <button
            onClick={onClick}
            className={`
                w-full text-left px-4 py-3 rounded-md text-sm font-bold tracking-widest uppercase transition-all duration-200
                ${isActive
                    ? 'bg-slate-300 text-[#0d0f1e] shadow-md'
                    : 'bg-[#1a1d2e] text-slate-200 hover:bg-[#1f2340]'}
            `}
        >
            {label}
        </button>
        {isActive && children && (
            <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-slate-600/50 pl-3">
                {children}
            </div>
        )}
    </div>
);

const SubNavButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="text-left text-xs text-slate-400 hover:text-slate-200 py-1.5 px-2 rounded hover:bg-[#1f2340] transition-colors tracking-wide uppercase"
    >
        {label}
    </button>
);

const Sidebar = (props) => {
    const isTeacher = (props.role.toUpperCase() === 'TEACHER')
    const [activeMenu, setActiveMenu] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    const toggle = (menu) => setActiveMenu(prev => prev === menu ? null : menu)

    return (
        <div className="h-full bg-[#161929] flex flex-col px-4 py-6 gap-3 border-r border-violet-900/40">
            {/* Brand */}
            <div className="mb-4 px-2">
                <span className="text-violet-400 text-xs font-bold tracking-[0.3em] uppercase">Scholaria</span>
                <div className="h-px bg-violet-800/30 mt-3" />
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