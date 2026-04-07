const AddQuestions = ({ question, choice, handleQuestionFieldChange, handleChoiceChange, handleSave, addChoice, handleSubmit }) => {
    return (
        <div className="flex gap-4 flex-col p-6">
            <input
                className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                type="text"
                value={question.question_text}
                placeholder="Question text..."
                onChange={(e) => handleQuestionFieldChange('question_text', e.target.value)}
            />

            <select
                className="p-5 font-sans border-2 border-violet-600 bg-[#2c3e50] text-white rounded"
                value={question.question_type}
                onChange={(e) => handleQuestionFieldChange('question_type', e.target.value)}
            >
                <option value="multiple_choices">Multi Choices</option>
                <option value="true_false">True / False</option>
            </select>

            {question.question_type === 'multiple_choices' && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-white font-semibold">Question Choices</h2>

                    {/* Existing choices */}
                    {question.choices.map((c, i) => (
                        <div key={i} className="p-2 bg-gray-700 rounded text-white text-sm">{c.choice}</div>
                    ))}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-grow p-3 rounded-md border border-violet-500 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            value={choice.choice}
                            placeholder="Choice..."
                            onChange={(e) => handleChoiceChange(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={addChoice}
                            className="px-4 py-2 text-white font-medium bg-cyan-600 rounded-lg hover:bg-cyan-500 transition duration-150"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={handleSave}
                className="w-full max-w-md p-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition duration-150"
            >
                Save Question
            </button>

            <button
                type="button"
                onClick={handleSubmit}
                className="w-full max-w-md p-3 font-extrabold text-gray-900 bg-green-400 rounded-lg hover:bg-green-300 transition duration-150"
            >
                Submit Quiz
            </button>
        </div>
    )
}

export default AddQuestions