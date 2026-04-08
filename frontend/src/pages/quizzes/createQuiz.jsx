const CreateQuiz = ({ quizData, coursesList, handleQuizFieldChange, toggleNext }) => {

    const canContinue = quizData.name.trim() && quizData.course && quizData.due_date

    return (
        <div className="flex flex-col items-center min-h-screen bg-[#0d0f1e] px-6 py-12">
            <div className="w-full max-w-lg bg-slate-800/80 border border-slate-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Create New Quiz</h1>
                    <p className="text-slate-400 text-sm mt-1">Step 1 of 2 — Basic Details</p>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 text-sm font-semibold tracking-wide uppercase">Quiz Title *</label>
                    <input
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                        type="text"
                        value={quizData.name}
                        placeholder="e.g. Chapter 4 Quiz"
                        onChange={(e) => handleQuizFieldChange('name', e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 text-sm font-semibold tracking-wide uppercase">Description</label>
                    <textarea
                        rows={3}
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                        value={quizData.description}
                        placeholder="What is this quiz about?"
                        onChange={(e) => handleQuizFieldChange('description', e.target.value)}
                    />
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 text-sm font-semibold tracking-wide uppercase">Due Date *</label>
                    <input
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                        type="date"
                        value={quizData.due_date}
                        onChange={(e) => handleQuizFieldChange('due_date', e.target.value)}
                    />
                </div>

                {/* Course Selection */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-semibold tracking-wide uppercase">Assign to Course *</label>
                    {coursesList?.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {coursesList.map((course) => (
                                <label
                                    key={course.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all
                                        ${quizData.course === course.id
                                            ? 'bg-violet-700/30 border-violet-500'
                                            : 'bg-slate-900/40 border-slate-700/50 hover:border-violet-600/50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="course"
                                        checked={quizData.course === course.id}
                                        onChange={() => handleQuizFieldChange('course', course.id)}
                                        className="w-4 h-4 accent-violet-500"
                                    />
                                    <span className="text-slate-200 font-medium">{course.course_name}</span>
                                    <span className="text-slate-400 text-xs ml-auto">{course.subject}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm italic">No courses available. Create a course first.</p>
                    )}
                </div>

                <button
                    onClick={() => toggleNext('questions')}
                    disabled={!canContinue}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-violet-700 hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
                >
                    Continue to Questions →
                </button>
            </div>
        </div>
    )
}

export default CreateQuiz