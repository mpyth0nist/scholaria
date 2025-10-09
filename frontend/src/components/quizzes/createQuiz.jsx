import { TextInput } from "../Reusable_components"
const createQuiz = ({quizData, setter, coursesList,  handleChange, toggleNext}) => {

    return (
            <div className=" text-white flex flex-col items-center p-8 space-y-6">
                {/* Quiz Inputs */}
                <TextInput
                    state={quizData}
                    value={quizData.name}
                    plh="Quiz Name..."
                    name="name"
                    handleChange={handleChange}
                    setter={setter}
                />
                <TextInput
                    state={quizData}
                    name="description"
                    value={quizData.description}
                    plh="Description..."
                    handleChange={handleChange}
                    setter={setter}
                />

                {/* Courses Checkboxes */}
                <div className="w-full max-w-md flex flex-col space-y-3">
                    {coursesList?.map((course) => (
                    <label key={course.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-800 cursor-pointer">
                        <input
                            type="radio"
                            name="course"
                            checked={quizData.course === course.id}
                            onChange={(e) => handleChange(quizData, e.target.name, course.id, setter)}
                            className="w-5 h-5 text-cyan-400 border-violet-500 rounded focus:ring-cyan-400 focus:ring-2"
                        />
                        <span className="text-white">{course.course_name}</span>
                    </label>
                    ))}

                    <button onClick={() => toggleNext('questions')}>Continue</button>
                </div>

            </div>

    )


}

export default createQuiz;