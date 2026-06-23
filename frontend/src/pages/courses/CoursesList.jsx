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
                    className="animate-scale-in btn-press flex flex-col premium-card overflow-hidden min-h-[360px]"
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
                            className="w-full h-full flex flex-col items-center justify-center gap-2 text-primary/30"
                            style={{ display: course.thumbnail ? 'none' : 'flex' }}
                        >
                            <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-primary/40">SCHOLARIA</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                        <h3 className="text-text font-serif font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">{course.course_name}</h3>
                        {course.subject && (
                            <p className="text-primary text-xs uppercase tracking-[0.15em] font-sans mt-1 font-semibold">{course.subject}</p>
                        )}
                        <p className={`text-sm mt-2.5 line-clamp-2 leading-relaxed ${course.description ? 'text-text/60' : 'text-text/40 italic'}`}>
                            {course.description || "No description provided for this course."}
                        </p>

                        {/* Actions — role-aware */}
                        <div className="flex gap-2.5 pt-4 mt-auto border-t border-primary/10">
                            <button
                                onClick={() => navigate(`/course/${course.id}/modules/`)}
                                className="btn-press flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 text-xs font-bold tracking-[0.12em] uppercase py-2 px-3 rounded-lg transition-colors font-sans"
                            >
                                {isTeacher ? 'Manage' : 'View Course'}
                            </button>

                            {/* Teacher-only actions */}
                            {isTeacher && (
                                <button
                                    onClick={() => navigate(`/update-course/${course.id}`)}
                                    className="btn-press bg-background hover:bg-primary/5 border border-primary/20 text-text/60 hover:text-action text-xs font-bold tracking-[0.12em] uppercase py-2 px-3 rounded-lg transition-colors font-sans"
                                >
                                    Edit
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