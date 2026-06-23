import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
    fetchQuiz,
    startAttempt,
    submitAnswer,
    submitQuiz,
    cancelAttempt,
} from "../../features/quizzes/quizSlice"

const PassQuiz = () => {
    const { quiz_id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const quiz = useSelector(state => state.quizzes.currentQuiz)
    const questions = useSelector(state => state.quizzes.currentQuizQuestions)
    const choices = useSelector(state => state.quizzes.currentQuizChoices)
    const loading = useSelector(state => state.quizzes.loading)
    const activeAttempt = useSelector(state => state.quizzes.activeAttempt)
    const attemptLoading = useSelector(state => state.quizzes.attemptLoading)
    const attemptError = useSelector(state => state.quizzes.attemptError)
    const submitResult = useSelector(state => state.quizzes.submitResult)
    const userData = useSelector(state => state.users.user)

    const isTeacher = userData?.role === 'Teacher'

    const [questionIndex, setQuestionIndex] = useState(0)
    const [selectedChoices, setSelectedChoices] = useState({}) // { [questionId]: choiceId }
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Build ordered question list
    const questionList = (quiz.questionsIds || []).map(qId => ({
        id: qId,
        ...questions[qId],
        choices: (questions[qId]?.choicesIds || []).map(cId => choices[cId]).filter(Boolean)
    }))

    // 1. Fetch quiz details + start an attempt on mount
    useEffect(() => {
        dispatch(fetchQuiz(quiz_id))
        if (!isTeacher) {
            dispatch(startAttempt(quiz_id))
        }
    }, [quiz_id, isTeacher])

    // ── Handlers ────────────────────────────────────────────────────

    const handleSelectChoice = (questionId, choiceId) => {
        setSelectedChoices(prev => ({ ...prev, [questionId]: choiceId }))
    }

    const handleNext = async () => {
        const currentQuestion = questionList[questionIndex]
        const choiceId = selectedChoices[currentQuestion.id]

        if (!choiceId) {
            setError("Please select an answer before continuing.")
            return
        }
        setError(null)

        if (!isTeacher) {
            // Submit the answer for this question
            const result = await dispatch(submitAnswer({
                attemptId: activeAttempt.id,
                questionId: currentQuestion.id,
                chosenChoices: [choiceId]
            }))

            // #8 Block navigation if the answer couldn't be saved
            if (submitAnswer.rejected.match(result)) {
                setError("Failed to save your answer. Please check your connection and try again.")
                return
            }
        }

        setQuestionIndex(prev => prev + 1)
    }

    const handleFinish = async () => {
        const currentQuestion = questionList[questionIndex]
        const choiceId = selectedChoices[currentQuestion.id]

        if (!choiceId) {
            setError("Please select an answer before finishing.")
            return
        }
        setError(null)
        setSubmitting(true)

        if (!isTeacher) {
            // Submit the final answer
            const result = await dispatch(submitAnswer({
                attemptId: activeAttempt.id,
                questionId: currentQuestion.id,
                chosenChoices: [choiceId]
            }))

            // #8 Block submission if the last answer couldn't be saved
            if (submitAnswer.rejected.match(result)) {
                setError("Failed to save your answer. Please check your connection and try again.")
                setSubmitting(false)
                return
            }

            // Submit the entire quiz for grading
            await dispatch(submitQuiz(activeAttempt.id))
        } else {
            // Mock finish for teacher preview
            navigate('/quizzes/list-quizzes/')
        }
        setSubmitting(false)
    }

    const handleCancel = async () => {
        if (!isTeacher && activeAttempt?.id) {
            await dispatch(cancelAttempt(activeAttempt.id))
        }
        navigate(-1)
    }

    // ── States ──────────────────────────────────────────────────────

    // Loading quiz or starting attempt
    if (loading || attemptLoading || !quiz.id || questionList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <div className="w-12 h-12 border-4 border-action border-t-transparent rounded-full animate-spin" />
                <p className="text-primary tracking-widest text-sm uppercase">Loading quiz...</p>
            </div>
        )
    }

    // Failed to start attempt (e.g. past due date, network error)
    if (attemptError) {
        const isDueDateError = attemptError.includes('due date') || attemptError.includes('403') || attemptError.includes('Forbidden')
        const message = isDueDateError
            ? 'This quiz is past its due date and can no longer be started.'
            : 'Could not start the quiz. Please check your connection and try again.'
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-6">
                <div className="bg-white/60 border border-red-700/40 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
                    <div className="text-3xl font-serif text-red-400 font-bold mb-4">Warning</div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Cannot Start Quiz</h2>
                    <p className="text-primary text-sm mb-8">{message}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 rounded-xl bg-primary/5 hover:bg-primary/10 text-white font-semibold transition-colors"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        )
    }

    // Result screen after submission
    if (submitResult) {
        // score comes back as a string from Django's DecimalField — parse it first
        const score = Number(submitResult.score ?? 0)
        const passed = score >= 50
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-6">
                <div className="bg-white/60 border border-primary/20 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl backdrop-blur-md">
                    <div className={`text-6xl font-black mb-2 ${passed ? 'text-primary' : 'text-red-400'}`}>
                        {score.toFixed(0)}%
                    </div>
                    <p className={`text-lg font-semibold mb-1 ${passed ? 'text-primary' : 'text-red-300'}`}>
                        {passed ? 'Quiz Passed!' : 'Quiz Failed'}
                    </p>
                    <p className="text-primary text-sm mb-8">
                        {/* #16 Show actually-answered count, not total quiz length */}
                        You answered {submitResult?.answers?.length ?? questionList.length} question{(submitResult?.answers?.length ?? questionList.length) !== 1 ? 's' : ''}.
                    </p>
                    <div className="w-full bg-primary/5 rounded-full h-3 mb-8 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${passed ? 'bg-primary' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 rounded-xl bg-action hover:bg-action text-white font-semibold tracking-wide transition-colors shadow-lg shadow-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Quiz in progress
    const currentQuestion = questionList[questionIndex]
    const isLastQuestion = questionIndex >= questionList.length - 1
    // #15 reaches 100% when on the last question
    const progress = ((questionIndex + 1) / questionList.length) * 100

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold text-text truncate max-w-sm">{quiz.name}</h1>
                            {isTeacher && (
                                <span className="bg-action/10 text-action text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border border-action/20">
                                    Preview Mode
                                </span>
                            )}
                        </div>
                        <p className="text-primary/70 text-xs mt-0.5 tracking-wide">
                            Question {questionIndex + 1} of {questionList.length}
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-primary/70 hover:text-red-400 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                    >
                        {isTeacher ? "Exit Preview" : "Cancel Quiz"}
                    </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/60 rounded-full h-1.5 mb-8 overflow-hidden">
                    <div
                        className="h-1.5 bg-action rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question card */}
                <div className="bg-white/60 border border-primary/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md">

                    {/* Question text */}
                    <p className="text-xl font-semibold text-text leading-relaxed mb-8">
                        {currentQuestion.question_text}
                    </p>

                    {/* Choices */}
                    <div className="space-y-3 mb-8">
                        {currentQuestion.choices.map(choice => {
                            const isSelected = selectedChoices[currentQuestion.id] === choice.id
                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => handleSelectChoice(currentQuestion.id, choice.id)}
                                    className={`
                                        w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium
                                        ${isSelected
                                            ? 'bg-action/10 border-action text-text shadow-lg shadow-sm'
                                            : 'bg-white/60 border-primary/20 text-text/80 hover:border-action/20 hover:text-text hover:bg-primary/5'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-violet-400 bg-action' : 'border-slate-500'
                                            }`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        {choice.choice}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="text-red-400 text-sm mb-4 flex items-center gap-2">
                            <span>!</span> {error}
                        </p>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={questionIndex === 0}
                            className="px-5 py-2.5 rounded-xl text-primary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium hover:bg-primary/5"
                        >
                            ← Previous
                        </button>

                        {isLastQuestion ? (
                            <button
                                onClick={handleFinish}
                                disabled={submitting}
                                className="px-8 py-3 rounded-xl bg-primary hover:bg-primary text-white font-semibold transition-colors shadow-lg shadow-emerald-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 rounded-xl bg-action hover:bg-action text-white font-semibold transition-colors shadow-lg shadow-sm"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PassQuiz