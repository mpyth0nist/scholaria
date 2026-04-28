import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CourseItem = ({ course, isTeacher, isSelected, onClick }) => {
    const navigate = useNavigate()

    if (isSelected) {
        return (
            <div className="flex flex-col bg-background border border-primary/20 rounded-xl shadow-lg w-[300px] h-[360px] overflow-hidden animate-fade-in transition-all duration-300 transform scale-100">
                {/* 16:9 Thumbnail */}
                <div className="w-full h-[168px] shrink-0 relative bg-primary/10 border-b border-primary/20 overflow-hidden">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:8000${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`}
                            alt={course.course_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background text-text w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors z-10"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-serif font-bold text-text text-lg leading-tight line-clamp-1">{course.course_name}</h3>
                    {course.subject && (
                        <p className="text-xs text-primary mt-1 uppercase tracking-widest font-semibold">{course.subject}</p>
                    )}
                    {course.description && (
                        <p className="text-primary text-sm mt-3 leading-relaxed line-clamp-2">{course.description}</p>
                    )}
                    
                    {/* Actions */}
                    <div className="mt-auto pt-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}/modules/`); }}
                            className="w-full py-2.5 px-4 rounded-lg bg-action hover:bg-[#a04618] text-white text-sm font-semibold tracking-wide transition-colors shadow-md"
                        >
                            {isTeacher ? 'Manage Course →' : 'View Course →'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-3 group focus:outline-none transition-all duration-300"
            aria-label={`Open ${course.course_name}`}
        >
            <div
                className="rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                style={{ width: '180px', height: '180px', minWidth: '180px' }}
            >
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:8000${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`}
                        alt={course.course_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-5xl">📚</span>
                    </div>
                )}
            </div>
            <span className="text-sm font-bold text-primary group-hover:text-text text-center max-w-[180px] line-clamp-1 transition-colors">
                {course.course_name}
            </span>
        </button>
    )
}

const RecentCourses = () => {
    const courses = useSelector(state => state.courses.courses)
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'
    const [selectedCourseId, setSelectedCourseId] = useState(null)

    // Show only 3 most recent
    const displayCourses = courses.slice(0, 3)

    if (!displayCourses.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-primary/60">
                <span className="text-3xl">📭</span>
                <p className="text-sm italic">No courses yet.</p>
            </div>
        )
    }

    return (
        <div className="flex justify-around items-center w-full gap-4 py-4 px-1 min-h-[380px]">
            {displayCourses.map(course => (
                <CourseItem
                    key={course.id}
                    course={course}
                    isTeacher={isTeacher}
                    isSelected={selectedCourseId === course.id}
                    onClick={() => setSelectedCourseId(prev => prev === course.id ? null : course.id)}
                />
            ))}
        </div>
    )
}

export default RecentCourses
