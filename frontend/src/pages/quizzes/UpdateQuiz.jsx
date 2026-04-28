import { useDispatch, useSelector }                                      from 'react-redux'
import { fetchQuiz, updateQuiz }                                          from '../../features/quizzes/quizSlice'
import { updateQuizName, updateQuizDescription }                          from '../../features/quizzes/quizSlice'
import { updateQuestionText, deleteQuestion, deleteChoice }               from '../../features/quizzes/quizSlice'
import { addChoiceToQuestion }                                            from '../../features/quizzes/quizSlice'
import { useState, useEffect }                                            from 'react'
import { useParams, useNavigate }                                         from 'react-router-dom'
import UpdateAddNewQuestion                                               from './UpdateAddNewQuestion'
import { ChevronDown, ChevronUp, Trash2, Plus, Save, ArrowLeft, PlusCircle } from 'lucide-react'

const EMPTY_DRAFT = { text: '', is_correct: false }


// ── Inline choice editor (single-correct-answer aware) ────────────────────────

function ChoiceRow({ choice, choiceId, questionId, allChoiceIds, allChoices }) {
    const dispatch = useDispatch()

    const isCorrect = choice?.is_correct ?? false

    const handleCorrectToggle = () => {
        if (isCorrect) return  // can't un-mark the only correct answer — use another choice
        // Mark this one correct, clear others in this question via updateChoice
        allChoiceIds.forEach(cid => {
            dispatch({ type: 'quiz/updateChoiceCorrect', payload: { id: cid, is_correct: cid === choiceId } })
        })
    }

    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm group
                ${isCorrect
                    ? 'bg-emerald-500/10 border-emerald-600/40'
                    : 'bg-slate-900/40 border-slate-700/50'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Correct toggle */}
            <button
                type="button"
                title={isCorrect ? 'Currently correct answer' : 'Mark as correct'}
                onClick={handleCorrectToggle}
                className="shrink-0"
            >
                {isCorrect
                    ? <span className="text-emerald-400 font-bold">◉</span>
                    : <span className="text-slate-500 hover:text-slate-300 transition">○</span>}
            </button>

            {/* Editable text */}
            <input
                type="text"
                value={choice?.choice ?? ''}
                onChange={(e) => dispatch({ type: 'quiz/updateChoiceFull', payload: { id: choiceId, choice: e.target.value } })}
                className={`flex-1 bg-transparent outline-none text-sm
                    ${isCorrect ? 'text-emerald-300' : 'text-slate-300'}`}
            />

            {isCorrect && <span className="text-xs text-emerald-500 font-semibold shrink-0">Correct</span>}

            <button
                type="button"
                onClick={() => dispatch(deleteChoice({ questionId, choiceId }))}
                className="text-slate-600 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

// ── Question accordion ────────────────────────────────────────────────────────

function QuestionAccordion({ questionId, question, choicesData, expanded, onToggle }) {
    const dispatch = useDispatch()

    // Local draft for the new-choice form inside this question
    const [draft,       setDraft]       = useState(EMPTY_DRAFT)
    const [showAddForm, setShowAddForm] = useState(false)

    const correctCount = question.choicesIds.filter(id => choicesData[id]?.is_correct).length
    const canAddChoice = draft.text.trim().length > 0

    const handleAddChoice = () => {
        if (!draft.text.trim()) return
        dispatch(addChoiceToQuestion({
            questionId,
            choice:     draft.text.trim(),
            is_correct: draft.is_correct,
        }))
        setDraft(EMPTY_DRAFT)
        setShowAddForm(false)
    }

    return (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-700/30 transition"
                onClick={() => onToggle(questionId)}
            >
                <span className="text-slate-200 text-sm font-medium flex-1 line-clamp-2">
                    {question.question_text || <span className="text-slate-500 italic">No question text</span>}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                    {correctCount === 1
                        ? <span className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/30 px-2 py-0.5 rounded-full">✓ Answer set</span>
                        : <span className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 px-2 py-0.5 rounded-full">⚠ No answer</span>}
                    <span className="text-slate-500 text-xs">{question.choicesIds.length} choice{question.choicesIds.length !== 1 ? 's' : ''}</span>
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <div className="px-5 pb-5 pt-2 space-y-4 border-t border-slate-700/40">

                    {/* Question text edit */}
                    <textarea
                        rows={2}
                        value={question.question_text}
                        onChange={(e) => dispatch(updateQuestionText({ id: questionId, question_text: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none text-sm"
                    />

                    {/* Choices list */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">
                            Choices
                            {correctCount === 1 && (
                                <span className="ml-2 text-emerald-400 normal-case">· 1 correct answer set ✓</span>
                            )}
                        </p>
                        {question.choicesIds.map(cid => (
                            <ChoiceRow
                                key={cid}
                                choiceId={cid}
                                choice={choicesData[cid]}
                                questionId={questionId}
                                allChoiceIds={question.choicesIds}
                                allChoices={choicesData}
                            />
                        ))}
                        {correctCount === 0 && question.choicesIds.length >= 2 && (
                            <p className="text-amber-400 text-xs">⚠ Click ○ on a choice to mark it as the correct answer</p>
                        )}
                    </div>

                    {/* ── Inline add-choice form ── */}
                    {showAddForm ? (
                        <div className="flex flex-col gap-2 bg-slate-900/40 border border-slate-700/50 rounded-xl p-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">New Choice</p>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Choice text…"
                                    value={draft.text}
                                    onChange={(e) => setDraft(d => ({ ...d, text: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChoice() } }}
                                    className="flex-grow p-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddChoice}
                                    disabled={!canAddChoice}
                                    className="px-3 py-2 text-white text-sm font-semibold bg-violet-700 hover:bg-violet-600 rounded-lg transition disabled:opacity-40"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDraft(EMPTY_DRAFT); setShowAddForm(false) }}
                                    className="px-3 py-2 text-slate-400 hover:text-slate-200 text-sm rounded-lg transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* is_correct toggle */}
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div
                                    onClick={() => setDraft(d => ({ ...d, is_correct: !d.is_correct }))}
                                    className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${draft.is_correct ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${draft.is_correct ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-slate-300 text-sm">
                                    {draft.is_correct
                                        ? <span className="text-emerald-400 font-semibold">
                                            Correct answer{' '}
                                            <span className="text-slate-500 font-normal text-xs">(replaces previous)</span>
                                          </span>
                                        : 'Mark as correct answer'}
                                </span>
                            </label>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-violet-300 text-sm transition"
                        >
                            <PlusCircle className="w-4 h-4" /> Add a choice
                        </button>
                    )}

                    {/* Delete question */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); dispatch(deleteQuestion({ id: questionId })) }}
                        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-sm transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete question
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const UpdateQuiz = () => {

    const dispatch   = useDispatch()
    const navigate   = useNavigate()
    const { quiz_id } = useParams()

    const quizData     = useSelector(state => state.quizzes.currentQuiz)
    const questionsData = useSelector(state => state.quizzes.currentQuizQuestions)
    const choicesData  = useSelector(state => state.quizzes.currentQuizChoices)
    const loading      = useSelector(state => state.quizzes.loading)

    const [expandedId,     setExpandedId]    = useState(null)
    const [showAddQuestion, setShowAddQuestion] = useState(false)
    const [status,          setStatus]        = useState(null) // 'saving' | 'saved' | 'error'

    useEffect(() => { dispatch(fetchQuiz(quiz_id)) }, [quiz_id])

    const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

    const handleSave = async (e) => {
        e.preventDefault()
        setStatus('saving')
        try {
            await dispatch(updateQuiz({ quiz: quizData, questions: questionsData, choices: choicesData })).unwrap()
            setStatus('saved')
            setTimeout(() => setStatus(null), 2500)
        } catch {
            setStatus('error')
        }
    }

    const questionIds = quizData.questionsIds ?? []

    return (
        <div className="min-h-screen bg-[#0d0f1e] px-6 py-12 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Edit Quiz</h1>
                        <p className="text-slate-400 text-sm">{questionIds.length} question{questionIds.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Status banner */}
                {status === 'saved' && (
                    <div className="bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm px-4 py-3 rounded-xl">
                        ✓ Quiz saved successfully
                    </div>
                )}
                {status === 'error' && (
                    <div className="bg-rose-900/30 border border-rose-700/40 text-rose-300 text-sm px-4 py-3 rounded-xl">
                        ✕ Save failed — check that every question has exactly 1 correct answer and at least 2 choices
                    </div>
                )}

                {/* Basic fields */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Quiz Details</p>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-300 text-sm font-semibold uppercase tracking-wide">Title *</label>
                        <input
                            type="text"
                            value={quizData.name}
                            onChange={(e) => dispatch(updateQuizName(e.target.value))}
                            className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-300 text-sm font-semibold uppercase tracking-wide">Description</label>
                        <textarea
                            rows={3}
                            value={quizData.description}
                            onChange={(e) => dispatch(updateQuizDescription(e.target.value))}
                            className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                        />
                    </div>
                </div>

                {/* Questions */}
                {loading ? (
                    <p className="text-slate-400 text-sm text-center py-8">Loading questions…</p>
                ) : (
                    <div className="space-y-3">
                        {questionIds.map((qid, i) => (
                            <div key={qid} className="flex gap-3 items-start">
                                <span className="mt-4 text-violet-400 font-bold text-sm w-5 shrink-0">{i + 1}.</span>
                                <div className="flex-1">
                                    <QuestionAccordion
                                        questionId={qid}
                                        question={questionsData[qid]}
                                        choicesData={choicesData}
                                        expanded={expandedId === qid}
                                        onToggle={toggleExpand}
                                    />
                                </div>
                            </div>
                        ))}

                        {questionIds.length === 0 && !showAddQuestion && (
                            <p className="text-slate-500 text-sm italic text-center py-6">No questions yet — add one below.</p>
                        )}
                    </div>
                )}

                {/* Add question form */}
                {showAddQuestion && (
                    <UpdateAddNewQuestion onDone={() => setShowAddQuestion(false)} />
                )}

                {/* Footer actions */}
                <div className="flex flex-col gap-3 pt-2">
                    {!showAddQuestion && (
                        <button
                            type="button"
                            onClick={() => setShowAddQuestion(true)}
                            className="w-full py-2.5 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 transition flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Question
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        className="w-full py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 transition shadow-lg shadow-violet-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {status === 'saving' ? 'Saving…' : 'Save Quiz'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default UpdateQuiz