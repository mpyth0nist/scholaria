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
        <div className="flex flex-col gap-6 p-6 text-slate-100">

            {/* ── greeting ── */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100">
                    Welcome back, <span className="text-violet-400">{firstName}</span> 👋
                </h1>
                <p className="text-slate-400 text-sm mt-1">Here's an overview of your enrolled courses and upcoming quizzes.</p>
            </div>

            {/* ── stats row ── */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:-translate-y-0.5 transition">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Enrolled Courses</p>
                    <p className="text-4xl font-bold text-white">{courses.length}</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:-translate-y-0.5 transition">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Quizzes Available</p>
                    <p className="text-4xl font-bold text-white">{quizzes.length}</p>
                </div>
            </div>

            {/* ── my courses ── */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">My Courses</h2>
                    <button
                        onClick={() => navigate('/all-courses')}
                        className="text-xs text-violet-400 hover:text-violet-300 transition"
                    >
                        View all →
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                        <span className="text-3xl">📭</span>
                        <p className="text-sm italic">You're not enrolled in any courses yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {courses.slice(0, 4).map(course => (
                            <button
                                key={course.id}
                                onClick={() => navigate(`/course/${course.id}/modules/`)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/40 hover:bg-slate-700/40 border border-slate-700/30 hover:border-violet-700/40 transition text-left group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-violet-700/20 border border-violet-600/30 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                                    {course.thumbnail
                                        ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                        : '📚'}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-slate-200 font-medium group-hover:text-white truncate transition">{course.course_name}</span>
                                    {course.subject && <span className="text-xs text-violet-400/70">{course.subject}</span>}
                                </div>
                                <span className="ml-auto text-slate-500 group-hover:text-violet-400 text-xs transition">→</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── available quizzes ── */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Available Quizzes</h2>
                    <button
                        onClick={() => navigate('/quizzes/list-quizzes/')}
                        className="text-xs text-violet-400 hover:text-violet-300 transition"
                    >
                        View all →
                    </button>
                </div>

                {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                        <span className="text-3xl">📭</span>
                        <p className="text-sm italic">No quizzes assigned yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {quizzes.slice(0, 4).map(quiz => (
                            <button
                                key={quiz.id}
                                onClick={() => navigate(`/quizzes/${quiz.id}/`)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/40 hover:bg-slate-700/40 border border-slate-700/30 hover:border-violet-700/40 transition text-left group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-emerald-700/20 border border-emerald-600/30 flex items-center justify-center text-lg shrink-0">
                                    📝
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-slate-200 font-medium group-hover:text-white truncate transition">{quiz.name}</span>
                                    {quiz.due_date && (
                                        <span className="text-xs text-amber-400/80">Due: {new Date(quiz.due_date).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <span className="ml-auto bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-md transition">
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