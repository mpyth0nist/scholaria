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
        // key on course.id so the animation re-fires when a different course is selected
        <div
            key={course.id}
            className="animate-card-expand flex flex-col bg-background border border-primary/20 rounded-xl shadow-lg w-[300px] h-[360px] overflow-hidden"
        >
            {/* Thumbnail */}
            <div className="w-full h-[168px] shrink-0 relative bg-primary/10 border-b border-primary/20 overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={thumbSrc(course.thumbnail)}
                        alt={course.course_name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-60">📚</div>
                )}
                {/* Close button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose() }}
                    className="btn-press absolute top-2 right-2 bg-background/80 hover:bg-background text-text/70 hover:text-text w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-primary/10 transition-colors z-10 text-lg leading-none"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
                <h3 className="font-serif font-bold text-text text-lg leading-tight line-clamp-1">
                    {course.course_name}
                </h3>
                {course.subject && (
                    <p className="text-xs text-primary mt-1 uppercase tracking-widest font-semibold opacity-80">
                        {course.subject}
                    </p>
                )}
                {course.description && (
                    <p className="text-text/60 text-sm mt-3 leading-relaxed line-clamp-2">
                        {course.description}
                    </p>
                )}

                {/* Action */}
                <div className="mt-auto pt-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}/modules/`) }}
                        className="btn-press w-full py-2.5 px-4 rounded-lg bg-action hover:bg-[#a04618] text-white text-sm font-semibold tracking-wide transition-colors shadow-md"
                    >
                        {isTeacher ? 'Manage Course →' : 'View Course →'}
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
        className="animate-course-bubble btn-press flex flex-col items-center gap-3 group focus:outline-none"
        style={{ animationDelay: `${index * 0.1}s` }}
        aria-label={`Open ${course.course_name}`}
    >
        {/* Circle */}
        <div
            className="rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 shadow-md group-hover:shadow-xl
                        transition-all duration-350 group-hover:scale-105 group-hover:opacity-90"
            style={{ width: '180px', height: '180px', minWidth: '180px' }}
        >
            {course.thumbnail ? (
                <img
                    src={thumbSrc(course.thumbnail)}
                    alt={course.course_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <span className="text-5xl opacity-70 group-hover:opacity-100 transition-opacity duration-300">📚</span>
                </div>
            )}
        </div>

        {/* Label */}
        <span className="text-sm font-bold text-primary/80 group-hover:text-text text-center max-w-[180px] line-clamp-1 transition-colors duration-200">
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
    const selectedCourse = displayCourses.find(c => c.id === selectedCourseId) ?? null

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
