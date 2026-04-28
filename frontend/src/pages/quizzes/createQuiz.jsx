const CreateQuiz = ({ quizData, coursesList, handleQuizFieldChange, toggleNext }) => {

    const canContinue = quizData.name.trim() && quizData.course && quizData.due_date

    return (
        <div className="flex flex-col items-center min-h-screen bg-background px-6 py-12">
            <div className="w-full max-w-lg bg-white/60 border border-primary/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-text">Create New Quiz</h1>
                    <p className="text-primary text-sm mt-1">Step 1 of 2 — Basic Details</p>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-text/80 text-sm font-semibold tracking-wide uppercase">Quiz Title *</label>
                    <input
                        className="w-full p-3 rounded-xl bg-white/60 border border-primary/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-action transition"
                        type="text"
                        value={quizData.name}
                        placeholder="e.g. Chapter 4 Quiz"
                        onChange={(e) => handleQuizFieldChange('name', e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-text/80 text-sm font-semibold tracking-wide uppercase">Description</label>
                    <textarea
                        rows={3}
                        className="w-full p-3 rounded-xl bg-white/60 border border-primary/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                        value={quizData.description}
                        placeholder="What is this quiz about?"
                        onChange={(e) => handleQuizFieldChange('description', e.target.value)}
                    />
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-text/80 text-sm font-semibold tracking-wide uppercase">Due Date *</label>
                    <input
                        className="w-full p-3 rounded-xl bg-white/60 border border-primary/20 text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                        type="date"
                        value={quizData.due_date}
                        onChange={(e) => handleQuizFieldChange('due_date', e.target.value)}
                    />
                </div>

                {/* Course Selection */}
                <div className="flex flex-col gap-2">
                    <label className="text-text/80 text-sm font-semibold tracking-wide uppercase">Assign to Course *</label>
                    {coursesList?.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {coursesList.map((course) => (
                                <label
                                    key={course.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all
                                        ${quizData.course === course.id
                                            ? 'bg-action/10 border-action'
                                            : 'bg-white/60 border-primary/20 hover:border-action/20'}`}
                                >
                                    <input
                                        type="radio"
                                        name="course"
                                        checked={quizData.course === course.id}
                                        onChange={() => handleQuizFieldChange('course', course.id)}
                                        className="w-4 h-4 accent-violet-500"
                                    />
                                    <span className="text-text font-medium">{course.course_name}</span>
                                    <span className="text-primary text-xs ml-auto">{course.subject}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-primary/70 text-sm italic">No courses available. Create a course first.</p>
                    )}
                </div>

                <button
                    onClick={() => toggleNext('questions')}
                    disabled={!canContinue}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-action hover:bg-action transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sm"
                >
                    Continue to Questions →
                </button>
            </div>
        </div>
    )
}

export default CreateQuiz