const AddQuestions = ({
    question,
    choice,
    handleQuestionFieldChange,
    handleChoiceChange,
    handleChoiceIsCorrectChange,
    handleSave,
    addChoice,
    handleSubmit,
    quizData
}) => {

    const correctCount   = question.choices.filter(c => c.is_correct).length
    const canSaveQuestion = question.question_text.trim() && question.choices.length >= 2 && correctCount === 1

    return (
        <div className="flex flex-col items-center min-h-screen bg-background px-6 py-12">
            <div className="w-full max-w-lg space-y-6">

                {/* Header */}
                <div className="bg-white/60 border border-primary/20 rounded-2xl p-6 backdrop-blur-md">
                    <h1 className="text-2xl font-bold text-text">Add Questions</h1>
                    <p className="text-primary text-sm mt-1">Step 2 of 2 — Build your questions</p>

                    {/* Summary */}
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs text-primary uppercase tracking-wider">Quiz:</span>
                        <span className="text-action text-sm font-semibold">{quizData?.name}</span>
                        <span className="ml-auto text-xs text-primary font-bold">
                            {quizData?.questions?.length || 0} question{quizData?.questions?.length !== 1 ? 's' : ''} added
                        </span>
                    </div>
                </div>

                {/* Saved questions preview */}
                {quizData?.questions?.length > 0 && (
                    <div className="bg-white/60 border border-primary/20 rounded-xl p-4 space-y-2">
                        <p className="text-primary text-xs uppercase tracking-wider font-semibold mb-2">Saved Questions</p>
                        {quizData.questions.map((q, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-action font-bold mt-0.5">{i + 1}.</span>
                                <span className="text-text/80">{q.question_text}</span>
                                <span className="ml-auto text-primary/70 text-xs whitespace-nowrap">{q.choices.length} choices</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Question form */}
                <div className="bg-white/60 border border-primary/20 rounded-2xl p-6 backdrop-blur-md space-y-5">
                    <h2 className="text-text font-semibold">New Question</h2>

                    {/* Question text */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-primary text-xs uppercase tracking-wider">Question Text *</label>
                        <textarea
                            rows={3}
                            className="w-full p-3 rounded-xl bg-white/60 border border-primary/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                            value={question.question_text}
                            placeholder="e.g. What is the capital of France?"
                            onChange={(e) => handleQuestionFieldChange('question_text', e.target.value)}
                        />
                    </div>

                    {/* Add choices */}
                    <div className="flex flex-col gap-2">
                        <label className="text-primary text-xs uppercase tracking-wider">
                            Choices <span className="text-primary/70 normal-case">({question.choices.length} added, min 2)</span>
                            {correctCount === 1 && (
                                <span className="ml-2 text-primary normal-case">· 1 correct answer set ✓</span>
                            )}
                        </label>

                        {/* Existing choices */}
                        {question.choices.map((c, i) => (
                            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm
                                ${c.is_correct
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-white/60 border-primary/20 text-text/80'}`}
                            >
                                {c.is_correct
                                    ? <span className="text-primary font-bold" title="Correct answer">◉</span>
                                    : <span className="text-primary/70">○</span>}
                                {c.choice}
                                {c.is_correct && <span className="ml-auto text-xs text-primary font-semibold">Correct</span>}
                            </div>
                        ))}

                        {/* New choice input */}
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                className="flex-grow p-3 rounded-xl bg-white/60 border border-primary/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                                value={choice.choice}
                                placeholder="Choice text..."
                                onChange={(e) => handleChoiceChange(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addChoice}
                                disabled={!choice.choice.trim()}
                                className="px-4 py-2 text-white font-semibold bg-action hover:bg-action rounded-xl transition disabled:opacity-40 text-sm"
                            >
                                Add
                            </button>
                        </div>

                        {/* is_correct toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div
                                onClick={() => handleChoiceIsCorrectChange(!choice.is_correct)}
                                className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${choice.is_correct ? 'bg-primary' : 'bg-slate-600'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${choice.is_correct ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-text/80 text-sm">
                                {choice.is_correct
                                    ? <span className="text-primary font-semibold">This is the correct answer <span className="text-primary/70 font-normal text-xs">(replaces any previous correct choice)</span></span>
                                    : 'Mark as correct answer'}
                            </span>
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSaveQuestion}
                        className="w-full py-2.5 rounded-xl font-semibold text-white bg-primary/5 hover:bg-primary/10 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm border border-primary/20"
                    >
                        + Save Question
                    </button>
                    {question.choices.length >= 2 && correctCount === 0 && (
                        <p className="text-action text-xs text-center">⚠ Mark one choice as the correct answer before saving</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!quizData?.questions?.length}
                    className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary transition shadow-lg shadow-emerald-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {quizData?.questions?.length
                        ? `Publish Quiz (${quizData.questions.length} question${quizData.questions.length !== 1 ? 's' : ''})`
                        : 'Add at least 1 question to publish'}
                </button>
            </div>
        </div>
    )
}

export default AddQuestions