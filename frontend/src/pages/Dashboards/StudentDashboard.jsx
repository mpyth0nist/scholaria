import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCourses } from '../../features/courses/coursesSlice'
import { fetchQuizzes } from '../../features/quizzes/quizSlice'

function Student() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const user = useSelector(state => state.users.user)
    const courses = useSelector(state => state.courses.courses)
    const quizzes = useSelector(state => state.quizzes.quizzes)

    useEffect(() => {
        dispatch(fetchCourses())
        dispatch(fetchQuizzes())
    }, [dispatch])

    const firstName = user?.first_name ?? ''

    return (
        <div className="flex flex-col gap-6 p-6 text-text">

            {/* ── greeting ── */}
            <div>
                <h1 className="text-2xl font-serif font-bold text-text">
                    Welcome back, <span className="text-action">{firstName}</span> 👋
                </h1>
                <p className="text-text/50 font-medium text-sm mt-1">Here's an overview of your enrolled courses and upcoming quizzes.</p>
            </div>

            {/* ── stats row ── */}
            <div className="grid grid-cols-2 gap-4">
                <div className="animate-scale-in bg-white/60 border border-primary/20 shadow-sm rounded-xl p-5 hover:-translate-y-0.5 transition-transform duration-300" style={{ animationDelay: '0.05s' }}>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Enrolled Courses</p>
                    <p className="text-4xl font-serif font-bold text-text">{courses.length}</p>
                </div>
                <div className="animate-scale-in bg-white/60 border border-primary/20 shadow-sm rounded-xl p-5 hover:-translate-y-0.5 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Quizzes Available</p>
                    <p className="text-4xl font-serif font-bold text-text">{quizzes.length}</p>
                </div>
            </div>

            {/* ── my courses ── */}
            <div className="bg-white/60 border border-primary/20 shadow-sm rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-primary">My Courses</h2>
                    <button
                        onClick={() => navigate('/all-courses')}
                        className="text-xs text-action hover:text-[#a04618] font-semibold transition"
                    >
                        View all →
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-primary/60 gap-2">
                        <span className="text-3xl">📭</span>
                        <p className="text-sm italic">You're not enrolled in any courses yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {courses.slice(0, 4).map((course, i) => (
                            <button
                                key={course.id}
                                onClick={() => navigate(`/course/${course.id}/modules/`)}
                                className="animate-item-enter btn-press flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-colors text-left group"
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={
                                                course.thumbnail.startsWith('http')
                                                    ? course.thumbnail
                                                    : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`
                                            }
                                            alt={course.course_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                                        />
                                    ) : null}
                                    <span style={{ display: course.thumbnail ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">📚</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-text font-bold group-hover:text-action truncate transition-colors">{course.course_name}</span>
                                    {course.subject && <span className="text-xs text-primary font-semibold">{course.subject}</span>}
                                </div>
                                <span className="ml-auto text-primary/50 group-hover:text-action text-xs transition-colors">→</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── available quizzes ── */}
            <div className="bg-white/60 border border-primary/20 shadow-sm rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Available Quizzes</h2>
                    <button
                        onClick={() => navigate('/quizzes/list-quizzes/')}
                        className="text-xs text-action hover:text-[#a04618] font-semibold transition"
                    >
                        View all →
                    </button>
                </div>

                {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-primary/60 gap-2">
                        <span className="text-3xl">📭</span>
                        <p className="text-sm italic">No quizzes assigned yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {quizzes.slice(0, 4).map((quiz, i) => (
                            <button
                                key={quiz.id}
                                onClick={() => navigate(`/quizzes/${quiz.id}/`)}
                                className="animate-item-enter btn-press flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-colors text-left group"
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                <div className="w-9 h-9 rounded-lg bg-action/10 border border-action/20 flex items-center justify-center text-lg shrink-0">
                                    📝
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-text font-bold group-hover:text-action truncate transition-colors">{quiz.name}</span>
                                    {quiz.due_date && (
                                        <span className="text-xs text-text/50 font-medium">Due: {new Date(quiz.due_date).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <span className="ml-auto bg-action hover:bg-[#a04618] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                    Take Quiz
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default Student