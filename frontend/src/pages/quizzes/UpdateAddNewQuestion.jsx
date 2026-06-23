import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addQuestion } from '../../features/quizzes/quizSlice'

// ─────────────────────────────────────────────────────────────────────────────
// UpdateAddNewQuestion
//
// Backend-compatible: builds { question_text, choices: [{choice, is_correct}] }
// then dispatches addQuestion() which pushes it into currentQuiz.questionsIds /
// currentQuizQuestions / currentQuizChoices (the same shape as fetchQuiz fills).
//
// Single-correct-answer rule: toggling a choice to "correct" clears all others.
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_CHOICE = { text: '', is_correct: false }

function UpdateAddNewQuestion({ onDone }) {

    const dispatch = useDispatch()

    const [questionText, setQuestionText] = useState('')
    const [choices, setChoices] = useState([])
    const [draft, setDraft] = useState(EMPTY_CHOICE)

    const correctCount = choices.filter(c => c.is_correct).length
    const canAddChoice = draft.text.trim().length > 0
    const canSave = questionText.trim() && choices.length >= 2 && correctCount === 1

    // ── Draft choice handlers ───────────────────────────────────────────────

    const handleDraftText = (val) => setDraft(d => ({ ...d, text: val }))

    const handleDraftCorrect = (val) => setDraft(d => ({ ...d, is_correct: val }))

    const addChoiceToDraft = () => {
        if (!draft.text.trim()) return
        setChoices(prev => {
            // Single-correct: if new choice is correct, strip existing correct flags
            const base = draft.is_correct
                ? prev.map(c => ({ ...c, is_correct: false }))
                : prev
            return [...base, { text: draft.text.trim(), is_correct: draft.is_correct }]
        })
        setDraft(EMPTY_CHOICE)
    }

    const removeChoice = (idx) => setChoices(prev => prev.filter((_, i) => i !== idx))

    // ── Save ────────────────────────────────────────────────────────────────

    const handleSave = () => {
        if (!canSave) return

        // Build the shape addQuestion expects: { id, question_text, choicesIds }
        // We generate a temporary client-side id (a timestamp string is fine — the
        // real DB id comes back from the server after updateQuiz is submitted).
        const tempId = `new_${Date.now()}`

        dispatch(addQuestion({
            id: tempId,
            question_text: questionText.trim(),
            // choicesIds will be populated from the choices we attach
            choicesIds: choices.map((_, i) => `${tempId}_c${i}`),
            // carry choice data so updateQuiz thunk can serialize it correctly
            _choiceData: choices,
        }))

        // Reset form
        setQuestionText('')
        setChoices([])
        setDraft(EMPTY_CHOICE)
        if (onDone) onDone()
    }

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="w-full premium-card p-6 space-y-5 border-action/30">

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-action font-sans">New Question</p>

            {/* Question text */}
            <textarea
                rows={3}
                placeholder="e.g. What is the capital of France?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full premium-input resize-none text-sm"
            />

            {/* Saved choices preview */}
            {choices.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary font-sans">
                        Choices
                        <span className="ml-2 text-primary/70 normal-case">({choices.length} added)</span>
                        {correctCount === 1 && (
                            <span className="ml-2 text-primary normal-case">· 1 correct answer set ✓</span>
                        )}
                    </p>
                    {choices.map((c, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm
                                ${c.is_correct
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-white/60 border-primary/20 text-text/80'}`}
                        >
                            {c.is_correct
                                ? <span className="text-primary font-bold" title="Correct">◉</span>
                                : <span className="text-primary/70">○</span>}
                            <span className="flex-1">{c.text}</span>
                            {c.is_correct && <span className="text-xs text-primary font-semibold">Correct</span>}
                            <button
                                type="button"
                                onClick={() => removeChoice(i)}
                                className="text-primary/70 hover:text-action text-xs ml-2 transition"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* New choice input */}
            <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary font-sans">Add choice</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Choice text…"
                        value={draft.text}
                        onChange={(e) => handleDraftText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChoiceToDraft() } }}
                        className="flex-grow premium-input text-sm"
                    />
                    <button
                        type="button"
                        onClick={addChoiceToDraft}
                        disabled={!canAddChoice}
                        className="px-4 py-2 text-white font-semibold bg-action hover:bg-action rounded-xl transition disabled:opacity-40 text-sm"
                    >
                        Add
                    </button>
                </div>

                {/* is_correct toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none mt-1">
                    <div
                        onClick={() => handleDraftCorrect(!draft.is_correct)}
                        className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${draft.is_correct ? 'bg-primary' : 'bg-slate-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${draft.is_correct ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-text/80 text-sm">
                        {draft.is_correct
                            ? <span className="text-primary font-semibold">
                                This is the correct answer{' '}
                                <span className="text-primary/70 font-normal text-xs">(replaces any previous correct choice)</span>
                            </span>
                            : 'Mark as correct answer'}
                    </span>
                </label>
            </div>

            {/* Validation hint */}
            {choices.length >= 2 && correctCount === 0 && (
                <p className="text-action text-xs">Note: Mark one choice as the correct answer before saving</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-primary/5 hover:bg-primary/10 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm border border-primary/20"
                >
                    + Save Question
                </button>
                {onDone && (
                    <button
                        type="button"
                        onClick={onDone}
                        className="px-4 py-2.5 rounded-xl text-primary hover:text-text text-sm transition"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}

export default UpdateAddNewQuestion