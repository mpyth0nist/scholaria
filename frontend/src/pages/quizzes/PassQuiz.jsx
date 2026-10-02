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
import { usePermissions } from "../../hooks/usePermissions.js"

// Detect code-like content (basic heuristic)
const hasCodeContent = (text) =>
    /[=\[\]{};()]/.test(text) && /print\(|def |import |#\w|\/\//.test(text)

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
    
    const { isTeacher } = usePermissions()

    const [questionIndex, setQuestionIndex] = useState(0)
    const [selectedChoices, setSelectedChoices] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [showAnswerKey, setShowAnswerKey] = useState(false)

    const questionList = (quiz.questionsIds || []).map(qId => ({
        id: qId,
        ...questions[qId],
        choices: (questions[qId]?.choicesIds || []).map(cId => choices[cId]).filter(Boolean)
    }))

    useEffect(() => {
        dispatch(fetchQuiz(quiz_id))
        if (!isTeacher) dispatch(startAttempt(quiz_id))
    }, [quiz_id, isTeacher])

    const handleSelectChoice = (questionId, choiceId) => {
        setSelectedChoices(prev => ({ ...prev, [questionId]: choiceId }))
    }

    // P0 #1 — keyboard navigation for radio group
    const handleChoiceKeyDown = (e, questionId, choiceList, idx) => {
        const len = choiceList.length
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleSelectChoice(questionId, choiceList[idx].id)
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault()
            const next = (idx + 1) % len
            document.getElementById(`choice-${choiceList[next].id}`)?.focus()
            handleSelectChoice(questionId, choiceList[next].id)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault()
            const prev = (idx - 1 + len) % len
            document.getElementById(`choice-${choiceList[prev].id}`)?.focus()
            handleSelectChoice(questionId, choiceList[prev].id)
        }
    }

    const handleNext = async () => {
        const q = questionList[questionIndex]
        if (!selectedChoices[q.id]) { setError("Please select an answer before continuing."); return }
        setError(null)
        if (!isTeacher) {
            const r = await dispatch(submitAnswer({ attemptId: activeAttempt.id, questionId: q.id, chosenChoices: [selectedChoices[q.id]] }))
            if (submitAnswer.rejected.match(r)) { setError("Failed to save your answer. Please check your connection and try again."); return }
        }
        setQuestionIndex(prev => prev + 1)
    }

    const handleFinish = async () => {
        const q = questionList[questionIndex]
        if (!selectedChoices[q.id]) { setError("Please select an answer before finishing."); return }
        setError(null)
        setSubmitting(true)
        if (!isTeacher) {
            const r = await dispatch(submitAnswer({ attemptId: activeAttempt.id, questionId: q.id, chosenChoices: [selectedChoices[q.id]] }))
            if (submitAnswer.rejected.match(r)) { setError("Failed to save your answer. Please check your connection and try again."); setSubmitting(false); return }
            await dispatch(submitQuiz(activeAttempt.id))
        } else {
            navigate('/quizzes/list-quizzes/')
        }
        setSubmitting(false)
    }

    const handleCancel = async () => {
        if (!isTeacher && activeAttempt?.id) await dispatch(cancelAttempt(activeAttempt.id))
        navigate(-1)
    }

    if (loading || attemptLoading || !quiz.id || questionList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <div className="w-12 h-12 border-4 border-action border-t-transparent rounded-full animate-spin" />
                <p className="text-primary tracking-widest text-sm uppercase">Loading quiz...</p>
            </div>
        )
    }

    if (attemptError) {
        const isDueDateError = attemptError.includes('due date') || attemptError.includes('403') || attemptError.includes('Forbidden')
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-6">
                <div className="bg-surface border border-red-700/40 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
                    <div className="text-3xl font-serif text-red-400 font-bold mb-4">Warning</div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Cannot Start Quiz</h2>
                    <p className="text-primary text-sm mb-8">
                        {isDueDateError ? 'This quiz is past its due date and can no longer be started.' : 'Could not start the quiz. Please check your connection and try again.'}
                    </p>
                    <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl bg-primary/5 hover:bg-primary/10 text-white font-semibold transition-colors">← Go Back</button>
                </div>
            </div>
        )
    }

    if (submitResult) {
        const score = Number(submitResult.score ?? 0)
        const passed = score >= 50
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-6">
                <div className="bg-surface border border-primary/20 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl backdrop-blur-md">
                    <div className={`text-6xl font-black mb-2 ${passed ? 'text-primary' : 'text-red-400'}`}>{score.toFixed(0)}%</div>
                    <p className={`text-lg font-semibold mb-1 ${passed ? 'text-primary' : 'text-red-300'}`}>{passed ? 'Quiz Passed!' : 'Quiz Failed'}</p>
                    <p className="text-primary text-sm mb-8">You answered {submitResult?.answers?.length ?? questionList.length} question{(submitResult?.answers?.length ?? questionList.length) !== 1 ? 's' : ''}.</p>
                    <div className="w-full bg-primary/5 rounded-full h-3 mb-8 overflow-hidden">
                        <div className={`h-3 rounded-full transition-all duration-1000 ${passed ? 'bg-primary' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-3 rounded-xl bg-action text-white font-semibold tracking-wide transition-colors shadow-lg">Back to Dashboard</button>
                </div>
            </div>
        )
    }

    const currentQuestion = questionList[questionIndex]
    const isLastQuestion = questionIndex >= questionList.length - 1
    const progress = ((questionIndex + 1) / questionList.length) * 100
    const looksLikeCode = hasCodeContent(currentQuestion.question_text)

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
                    {/* #24: Styled Exit Preview button */}
                    <button
                        onClick={handleCancel}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                            isTeacher
                                ? 'text-action border-action/30 hover:bg-action/10'
                                : 'text-primary/70 border-transparent hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20'
                        }`}
                    >
                        {isTeacher ? "← Exit Preview" : "Cancel Quiz"}
                    </button>
                </div>

                {/* #25: Taller progress bar with ARIA */}
                <div className="w-full bg-surface rounded-full h-2.5 mb-4 overflow-hidden border border-primary/10">
                    <div
                        className="h-2.5 bg-action rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={questionIndex + 1}
                        aria-valuemin={1}
                        aria-valuemax={questionList.length}
                        aria-label={`Question ${questionIndex + 1} of ${questionList.length}`}
                    />
                </div>

                {/* #20: Question jump strip */}
                <div className="flex gap-1.5 mb-6 flex-wrap" role="navigation" aria-label="Jump to question">
                    {questionList.map((q, i) => (
                        <button
                            key={q.id}
                            onClick={() => setQuestionIndex(i)}
                            aria-label={`Question ${i + 1}${selectedChoices[q.id] ? ', answered' : ''}`}
                            aria-current={i === questionIndex ? 'step' : undefined}
                            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all border ${
                                i === questionIndex
                                    ? 'bg-action text-white border-action shadow-sm'
                                    : selectedChoices[q.id]
                                        ? 'bg-primary/20 text-primary border-primary/30'
                                        : 'bg-surface text-text/50 border-border hover:border-primary/40'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                {/* Question card */}
                <div className="bg-surface border border-primary/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md">

                    {/* #7: Code block rendering */}
                    {looksLikeCode ? (
                        <pre className="bg-black/20 dark:bg-white/5 border border-primary/10 rounded-xl p-4 text-sm font-mono text-text leading-relaxed overflow-x-auto whitespace-pre-wrap mb-8">
                            <code>{currentQuestion.question_text}</code>
                        </pre>
                    ) : (
                        <p id={`q-label-${currentQuestion.id}`} className="text-xl font-semibold text-text leading-relaxed mb-8">
                            {currentQuestion.question_text}
                        </p>
                    )}

                    {/* #19: Teacher answer key toggle */}
                    {isTeacher && (
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => setShowAnswerKey(p => !p)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition ${
                                    showAnswerKey ? 'bg-primary text-white border-primary/20' : 'bg-surface border-border text-primary hover:bg-primary/10'
                                }`}
                            >
                                {showAnswerKey ? '✓ Key On' : 'Answer Key'}
                            </button>
                        </div>
                    )}

                    {/* P0 #1: radiogroup with keyboard navigation */}
                    <div
                        role="radiogroup"
                        aria-label={currentQuestion.question_text}
                        className="space-y-3 mb-8"
                    >
                        {currentQuestion.choices.map((choice, ci) => {
                            const isSelected = selectedChoices[currentQuestion.id] === choice.id
                            const isCorrect = showAnswerKey && choice.is_correct
                            return (
                                <div
                                    key={choice.id}
                                    id={`choice-${choice.id}`}
                                    role="radio"
                                    aria-checked={isSelected}
                                    tabIndex={isSelected || (!selectedChoices[currentQuestion.id] && ci === 0) ? 0 : -1}
                                    onClick={() => handleSelectChoice(currentQuestion.id, choice.id)}
                                    onKeyDown={(e) => handleChoiceKeyDown(e, currentQuestion.id, currentQuestion.choices, ci)}
                                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium cursor-pointer select-none ${
                                        isCorrect
                                            ? 'bg-primary/10 border-primary text-text'
                                            : isSelected
                                                ? 'bg-action/10 border-action text-text shadow-sm'
                                                : 'bg-surface border-primary/20 text-text/80 hover:border-action/20 hover:text-text hover:bg-primary/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                            isCorrect ? 'border-primary bg-primary' : isSelected ? 'border-violet-400 bg-action' : 'border-slate-500'
                                        }`}>
                                            {(isSelected || isCorrect) && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span>{choice.choice}</span>
                                        {isCorrect && (
                                            <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Correct</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {error && (
                        <p role="alert" className="text-red-400 text-sm mb-4 flex items-center gap-2">
                            <span aria-hidden="true">!</span> {error}
                        </p>
                    )}

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
                                className="px-8 py-3 rounded-xl bg-primary text-white font-semibold transition-colors shadow-lg shadow-emerald-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 rounded-xl bg-action text-white font-semibold transition-colors shadow-lg"
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