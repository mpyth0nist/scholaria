import { useSelector, useDispatch } from "react-redux"
import { fetchQuizzes, deleteQuiz } from "../../features/quizzes/quizSlice"
import { fetchUser } from "../../features/users/userSlice"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const QuizList = () => {
    const quizzes = useSelector(state => state.quizzes.quizzes)
    const userData = useSelector(state => state.users.user)
    const loading = useSelector(state => state.quizzes.loading)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(fetchQuizzes())
        dispatch(fetchUser())
    }, [])

    const isTeacher = userData?.role === 'Teacher'

    // ── loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="h-8 w-48 bg-primary/5 rounded-lg animate-pulse" />
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/60 rounded-xl animate-pulse border border-primary/20" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 text-text">

            {/* ── header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-text">Quizzes</h1>
                    <p className="text-text/50 text-sm mt-1">
                        {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available
                    </p>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => navigate('/quizzes/create-quiz/')}
                        className="flex items-center gap-2 bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
                    >
                        <span className="text-lg leading-none">+</span> New Quiz
                    </button>
                )}
            </div>

            {/* ── empty state ── */}
            {quizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-primary/70 gap-4">
                    <span className="text-5xl">📝</span>
                    <p className="text-sm italic">
                        {isTeacher ? 'No quizzes yet. Create your first one above.' : 'No quizzes available yet.'}
                    </p>
                </div>
            ) : (
                /* ── quiz list ── */
                <div className="flex flex-col gap-3">
                    {quizzes.map((quiz, i) => (
                        <div
                            key={quiz.id}
                            className="animate-item-enter btn-press group bg-white/60 border border-primary/20 rounded-xl px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-4"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            {/* icon */}
                            <div className="w-10 h-10 rounded-lg bg-action/10 border border-action/20 flex items-center justify-center text-xl shrink-0">
                                📝
                            </div>

                            {/* info */}
                            <div className="flex flex-col min-w-0 flex-1">
                                <button
                                    onClick={() => quiz.my_score == null ? navigate(`/quizzes/${quiz.id}/`) : null}
                                    className={`text-text font-semibold text-sm text-left transition truncate ${
                                        quiz.my_score == null
                                            ? 'hover:text-action cursor-pointer'
                                            : 'cursor-default opacity-80'
                                    }`}
                                >
                                    {quiz.name}
                                </button>
                                <div className="flex items-center gap-3 mt-1">
                                    {quiz.description && (
                                        <p className="text-xs text-text/50 truncate max-w-xs">{quiz.description}</p>
                                    )}
                                    {quiz.due_date && (
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                            new Date(quiz.due_date) < new Date()
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-action/10 text-action border-amber-500/20'
                                        }`}>
                                            Due {new Date(quiz.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {isTeacher ? (
                                    <>
                                        <button
                                            onClick={() => navigate(`/quizzes/${quiz.id}/`)}
                                            className="text-xs text-primary hover:text-action px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
                                        >
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => navigate(`/quizzes/update-quiz/${quiz.id}`)}
                                            className="text-xs text-primary hover:text-action px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => dispatch(deleteQuiz(quiz.id))}
                                            className="text-xs text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
                                        >
                                            🗑 Delete
                                        </button>
                                    </>
                                ) : quiz.my_score != null ? (
                                    /* ── Already completed: show score badge ── */
                                    <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${
                                        quiz.my_score >= 50
                                            ? 'bg-primary/10 border-primary/20 text-primary'
                                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                                    }`}>
                                        <span className="text-lg font-black leading-none">
                                            {quiz.my_score.toFixed(0)}%
                                        </span>
                                        <span className="text-[10px] font-medium mt-0.5 tracking-wide uppercase opacity-70">
                                            {quiz.my_score >= 50 ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                ) : (
                                    /* ── Not yet taken ── */
                                    <button
                                        onClick={() => navigate(`/quizzes/${quiz.id}/`)}
                                        className="bg-action hover:bg-action active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                                    >
                                        Take Quiz →
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default QuizList
