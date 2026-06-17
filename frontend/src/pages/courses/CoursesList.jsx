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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
            {courses.map((course, i) => (
                <div
                    key={course.id}
                    className="animate-scale-in btn-press flex flex-col bg-background border border-primary/20 rounded-xl shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 overflow-hidden min-h-[360px]"
                    style={{ animationDelay: `${i * 0.07}s` }}
                >
                    {/* 16:9 Thumbnail */}
                    <div className="w-full aspect-[16/9] relative bg-primary/10 border-b border-primary/20 shrink-0 overflow-hidden">
                        {course.thumbnail ? (
                            <img
                                src={
                                    course.thumbnail.startsWith('http')
                                        ? course.thumbnail
                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`
                                }
                                alt={course.course_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextSibling.style.display = 'flex'
                                }}
                            />
                        ) : null}
                        <div
                            className="w-full h-full flex items-center justify-center text-4xl"
                            style={{ display: course.thumbnail ? 'none' : 'flex' }}
                        >
                            📚
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                        <h3 className="text-text font-serif font-bold text-lg leading-tight line-clamp-1">{course.course_name}</h3>
                        {course.subject && (
                            <p className="text-primary text-xs uppercase tracking-widest mt-1 font-semibold">{course.subject}</p>
                        )}
                        {course.description && (
                            <p className="text-text/60 text-sm mt-2.5 line-clamp-2 leading-relaxed">{course.description}</p>
                        )}

                        {/* Actions — role-aware */}
                        <div className="flex gap-2.5 pt-4 mt-auto border-t border-primary/10">
                            <button
                                onClick={() => navigate(`/course/${course.id}/modules/`)}
                                className="btn-press flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 text-xs font-bold py-2 px-3 rounded-lg transition-colors tracking-wide uppercase"
                            >
                                {isTeacher ? 'Manage' : 'View Course'}
                            </button>

                            {/* Teacher-only actions */}
                            {isTeacher && (
                                <button
                                    onClick={() => navigate(`/update-course/${course.id}`)}
                                    className="btn-press bg-background hover:bg-primary/5 border border-primary/20 text-text/60 hover:text-action text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {page !== 'Courses' && (
                <div className="col-span-full mt-4 flex justify-end">
                    <button
                        onClick={() => navigate('/all-courses')}
                        className="text-sm font-medium text-action hover:text-[#a04618] underline underline-offset-4 transition-colors"
                    >
                        View all courses →
                    </button>
                </div>
            )}
        </div>
    )
}

export default CoursesList