import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CourseModal = ({ course, onClose, isTeacher }) => {
    const navigate = useNavigate()

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal box — stop clicks from bubbling to backdrop */}
            <div
                className="relative bg-[#13152a] border border-violet-700/50 rounded-2xl shadow-2xl w-96 p-6 flex flex-col gap-5 animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-slate-500 hover:text-slate-200 text-2xl leading-none transition-colors"
                    aria-label="Close"
                >
                    ×
                </button>

                {/* Thumbnail circle */}
                <div className="flex justify-center">
                    <div className="w-28 h-28 rounded-full border-2 border-violet-600/60 overflow-hidden shadow-lg shadow-violet-900/40">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.course_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-800/60 to-indigo-900/60 flex items-center justify-center">
                                <span className="text-4xl">📚</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-100 leading-tight">{course.course_name}</h3>
                    {course.subject && (
                        <p className="text-xs text-violet-400 mt-1 uppercase tracking-widest">{course.subject}</p>
                    )}
                    {course.description && (
                        <p className="text-slate-400 text-sm mt-3 leading-relaxed line-clamp-3">{course.description}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="py-2.5 px-4 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-sm font-semibold tracking-wide transition-colors border border-slate-600/40"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => navigate(`/course/${course.id}/modules/`)}
                        className="py-2.5 px-4 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold tracking-wide transition-colors shadow-lg shadow-violet-900/40 border border-violet-500/30"
                    >
                        {isTeacher ? 'Manage Course →' : 'View Course →'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const RecentCourses = () => {
    const courses = useSelector(state => state.courses.courses)
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'
    const [selectedCourse, setSelectedCourse] = useState(null)

    // Show only 3 most recent
    const displayCourses = courses.slice(0, 3)

    if (!displayCourses.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-500">
                <span className="text-3xl">📭</span>
                <p className="text-sm italic">No courses yet.</p>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-around items-center w-full gap-4 py-2 px-1">
                {displayCourses.map(course => (
                    <button
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className="flex flex-col items-center gap-3 group focus:outline-none"
                        aria-label={`Open ${course.course_name}`}
                    >
                        {/* Circle thumbnail — 96px so 3 fit side-by-side in a 1/3 col */}
                        <div
                            className="rounded-full overflow-hidden border-2 border-violet-600/50 group-hover:border-violet-400 shadow-lg shadow-violet-900/30 group-hover:shadow-violet-700/50 transition-all duration-300 group-hover:scale-105"
                            style={{ width: '180px', height: '180px', minWidth: '180px' }}
                        >
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.course_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-900/70 to-indigo-900/70 flex items-center justify-center">
                                    <span className="text-5xl">📚</span>
                                </div>
                            )}
                        </div>

                        {/* Course name below the circle */}
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 text-center max-w-[180px] line-clamp-1 transition-colors">
                            {course.course_name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Modal */}
            {selectedCourse && (
                <CourseModal
                    course={selectedCourse}
                    isTeacher={isTeacher}
                    onClose={() => setSelectedCourse(null)}
                />
            )}
        </>
    )
}

export default RecentCourses
