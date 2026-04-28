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
        <div className="flex flex-col items-center min-h-screen bg-[#0d0f1e] px-6 py-12">
            <div className="w-full max-w-lg space-y-6">

                {/* Header */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
                    <h1 className="text-2xl font-bold text-slate-100">Add Questions</h1>
                    <p className="text-slate-400 text-sm mt-1">Step 2 of 2 — Build your questions</p>

                    {/* Summary */}
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Quiz:</span>
                        <span className="text-violet-300 text-sm font-semibold">{quizData?.name}</span>
                        <span className="ml-auto text-xs text-emerald-400 font-bold">
                            {quizData?.questions?.length || 0} question{quizData?.questions?.length !== 1 ? 's' : ''} added
                        </span>
                    </div>
                </div>

                {/* Saved questions preview */}
                {quizData?.questions?.length > 0 && (
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 space-y-2">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Saved Questions</p>
                        {quizData.questions.map((q, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-violet-400 font-bold mt-0.5">{i + 1}.</span>
                                <span className="text-slate-300">{q.question_text}</span>
                                <span className="ml-auto text-slate-500 text-xs whitespace-nowrap">{q.choices.length} choices</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Question form */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md space-y-5">
                    <h2 className="text-slate-200 font-semibold">New Question</h2>

                    {/* Question text */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-xs uppercase tracking-wider">Question Text *</label>
                        <textarea
                            rows={3}
                            className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                            value={question.question_text}
                            placeholder="e.g. What is the capital of France?"
                            onChange={(e) => handleQuestionFieldChange('question_text', e.target.value)}
                        />
                    </div>

                    {/* Add choices */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-xs uppercase tracking-wider">
                            Choices <span className="text-slate-500 normal-case">({question.choices.length} added, min 2)</span>
                            {correctCount === 1 && (
                                <span className="ml-2 text-emerald-400 normal-case">· 1 correct answer set ✓</span>
                            )}
                        </label>

                        {/* Existing choices */}
                        {question.choices.map((c, i) => (
                            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm
                                ${c.is_correct
                                    ? 'bg-emerald-500/10 border-emerald-600/40 text-emerald-300'
                                    : 'bg-slate-900/40 border-slate-700/50 text-slate-300'}`}
                            >
                                {c.is_correct
                                    ? <span className="text-emerald-400 font-bold" title="Correct answer">◉</span>
                                    : <span className="text-slate-500">○</span>}
                                {c.choice}
                                {c.is_correct && <span className="ml-auto text-xs text-emerald-500 font-semibold">Correct</span>}
                            </div>
                        ))}

                        {/* New choice input */}
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                className="flex-grow p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
                                value={choice.choice}
                                placeholder="Choice text..."
                                onChange={(e) => handleChoiceChange(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addChoice}
                                disabled={!choice.choice.trim()}
                                className="px-4 py-2 text-white font-semibold bg-violet-700 hover:bg-violet-600 rounded-xl transition disabled:opacity-40 text-sm"
                            >
                                Add
                            </button>
                        </div>

                        {/* is_correct toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div
                                onClick={() => handleChoiceIsCorrectChange(!choice.is_correct)}
                                className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${choice.is_correct ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${choice.is_correct ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-slate-300 text-sm">
                                {choice.is_correct
                                    ? <span className="text-emerald-400 font-semibold">This is the correct answer <span className="text-slate-500 font-normal text-xs">(replaces any previous correct choice)</span></span>
                                    : 'Mark as correct answer'}
                            </span>
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSaveQuestion}
                        className="w-full py-2.5 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm border border-slate-600"
                    >
                        + Save Question
                    </button>
                    {question.choices.length >= 2 && correctCount === 0 && (
                        <p className="text-amber-400 text-xs text-center">⚠ Mark one choice as the correct answer before saving</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!quizData?.questions?.length}
                    className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
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