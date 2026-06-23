import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const thumbSrc = (thumbnail) => {
    if (!thumbnail) return null
    if (thumbnail.startsWith('http')) return thumbnail
    return `${API_BASE}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`
}

// ── Expanded card (shown when a course bubble is clicked) ─────────────────
const CourseCard = ({ course, isTeacher, onClose }) => {
    const navigate = useNavigate()

    return (
        <div
            key={course.id}
            className="animate-card-expand flex flex-col premium-card shadow-2xl w-[280px] h-[340px] overflow-hidden"
        >
            {/* Thumbnail */}
            <div className="w-full h-[140px] shrink-0 relative bg-primary/10 border-b border-primary/20 overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={thumbSrc(course.thumbnail)}
                        alt={course.course_name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-sans font-bold tracking-[0.2em] text-primary/30">SCHOLARIA</div>
                )}
                {/* Close button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose() }}
                    className="btn-press absolute top-2 right-2 bg-background/80 hover:bg-background text-text/70 hover:text-text w-7 h-7 rounded-full flex items-center justify-center shadow-sm border border-primary/10 transition-colors z-10 text-base leading-none"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
                <h3 className="font-serif font-bold text-text text-base leading-tight line-clamp-1">
                    {course.course_name}
                </h3>
                {course.subject && (
                    <p className="text-[10px] text-primary mt-1 uppercase tracking-widest font-sans font-semibold opacity-85">
                        {course.subject}
                    </p>
                )}
                {course.description && (
                    <p className="text-text/60 text-xs mt-2.5 leading-relaxed line-clamp-2">
                        {course.description}
                    </p>
                )}

                {/* Action */}
                <div className="mt-auto pt-3 border-t border-primary/10">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}/modules/`) }}
                        className="btn-press w-full py-2 px-3 rounded-lg bg-action hover:bg-action active:scale-95 text-white text-xs font-bold tracking-wide uppercase font-sans transition-colors shadow"
                    >
                        {isTeacher ? 'Manage →' : 'View Course →'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Idle bubble (the circular avatar shown before clicking) ───────────────
const CourseBubble = ({ course, index, onClick }) => (
    <button
        onClick={onClick}
        className="animate-course-bubble btn-press flex flex-col items-center gap-2.5 group focus:outline-none"
        style={{ animationDelay: `${index * 0.08}s` }}
        aria-label={`Open ${course.course_name}`}
    >
        {/* Circle */}
        <div
            className="rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 shadow-md group-hover:shadow-xl
                        transition-all duration-300 group-hover:scale-105 group-hover:opacity-95"
            style={{ width: '120px', height: '120px', minWidth: '120px' }}
        >
            {course.thumbnail ? (
                <img
                    src={thumbSrc(course.thumbnail)}
                    alt={course.course_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <span className="text-[10px] font-sans font-bold tracking-[0.15em] text-primary/40 group-hover:text-primary/70 transition-colors duration-300">SCHOLARIA</span>
                </div>
            )}
        </div>

        {/* Label */}
        <span className="text-xs font-bold text-primary/80 group-hover:text-text text-center max-w-[125px] line-clamp-2 transition-colors duration-200 uppercase tracking-wider font-sans">
            {course.course_name}
        </span>
    </button>
)

// ── Main component ────────────────────────────────────────────────────────
const RecentCourses = () => {
    const courses = useSelector(state => state.courses.courses)
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'
    const [selectedCourseId, setSelectedCourseId] = useState(null)

    const displayCourses = courses.slice(0, 3)

    if (!displayCourses.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-primary/60">
                <p className="text-sm italic">No courses yet.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap justify-center sm:justify-around items-center w-full gap-6 py-4 px-1 min-h-[180px]">
            {displayCourses.map((course, i) =>
                selectedCourseId === course.id ? (
                    <CourseCard
                        key={course.id}
                        course={course}
                        isTeacher={isTeacher}
                        onClose={() => setSelectedCourseId(null)}
                    />
                ) : (
                    <CourseBubble
                        key={course.id}
                        course={course}
                        index={i}
                        onClick={() => setSelectedCourseId(course.id)}
                    />
                )
            )}
        </div>
    )
}

export default RecentCourses
