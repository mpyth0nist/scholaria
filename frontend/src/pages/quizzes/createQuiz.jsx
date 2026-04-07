import { TextInput } from "../../components/TextInputMain"

const CreateQuiz = ({ quizData, coursesList, handleQuizFieldChange, toggleNext }) => {

    return (
        <div className="text-white flex flex-col items-center p-8 space-y-6">
            {/* Quiz Inputs */}
            <input
                className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                type="text"
                value={quizData.name}
                placeholder="Quiz Name..."
                onChange={(e) => handleQuizFieldChange('name', e.target.value)}
            />
            <input
                className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                type="text"
                value={quizData.description}
                placeholder="Description..."
                onChange={(e) => handleQuizFieldChange('description', e.target.value)}
            />

            {/* Courses Checkboxes */}
            <div className="w-full max-w-md flex flex-col space-y-3">
                {coursesList?.map((course) => (
                    <label key={course.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-800 cursor-pointer">
                        <input
                            type="radio"
                            name="course"
                            checked={quizData.course === course.id}
                            onChange={() => handleQuizFieldChange('course', course.id)}
                            className="w-5 h-5 text-cyan-400 border-violet-500 rounded focus:ring-cyan-400 focus:ring-2"
                        />
                        <span className="text-white">{course.course_name}</span>
                    </label>
                ))}

                <button
                    onClick={() => toggleNext('questions')}
                    className="mt-4 w-full p-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition duration-150"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}

export default CreateQuiz