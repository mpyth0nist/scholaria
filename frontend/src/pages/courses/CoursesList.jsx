import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCourses } from '../../features/courses/coursesSlice'

const CoursesList = ({ page }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const courses = useSelector(state => state.courses.courses)
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    useEffect(() => {
        dispatch(fetchCourses())
    }, [dispatch])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2">
            {courses.map(course => (
                <div
                    key={course.id}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-violet-700/40 transition"
                >
                    {/* Thumbnail */}
                    <div className="h-40 w-full bg-gradient-to-br from-violet-900/50 to-indigo-900/50 overflow-hidden">
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.course_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-3">
                        <div>
                            <h3 className="text-slate-100 font-semibold text-base line-clamp-1">{course.course_name}</h3>
                            {course.subject && (
                                <p className="text-violet-400 text-xs uppercase tracking-widest mt-0.5">{course.subject}</p>
                            )}
                            {course.description && (
                                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{course.description}</p>
                            )}
                        </div>

                        {/* Actions — role-aware */}
                        <div className="flex gap-2 pt-1 border-t border-slate-700/50">
                            <button
                                onClick={() => navigate(`/course/${course.id}/modules/`)}
                                className="flex-1 bg-violet-700/20 hover:bg-violet-700/40 border border-violet-600/30 text-violet-300 hover:text-violet-100 text-xs font-semibold py-2 px-3 rounded-lg transition"
                            >
                                {isTeacher ? 'Manage Modules' : 'View Course'}
                            </button>

                            {/* Teacher-only actions */}
                            {isTeacher && (
                                <button
                                    onClick={() => navigate(`/update-course/${course.id}`)}
                                    className="bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/40 text-slate-300 hover:text-slate-100 text-xs font-semibold py-2 px-3 rounded-lg transition"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {page !== 'Courses' && (
                <button
                    onClick={() => navigate('/all-courses')}
                    className="col-span-full text-sm text-violet-400 hover:text-violet-300 underline underline-offset-2 mt-2 transition"
                >
                    View all courses →
                </button>
            )}
        </div>
    )
}

export default CoursesList