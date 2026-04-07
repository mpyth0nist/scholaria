import { useDispatch, useSelector } from "react-redux"
import { fetchQuiz, updateQuiz } from "../../features/quizzes/quizSlice"
import { updateQuizName, updateQuizDescription } from "../../features/quizzes/quizSlice"
import QuestionItem from "./QuestionItem"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import UpdateAddNewQuestion from "./UpdateAddNewQuestion"
const UpdateQuiz = () => {

    let quizData = useSelector(state => state.quizzes.currentQuiz)
    let questionsData = useSelector(state => state.quizzes.currentQuizQuestions)
    let choicesData = useSelector(state => state.quizzes.currentQuizChoices)


    const { quiz_id } = useParams()
    const dispatch = useDispatch()
    let [toggleQuestion, setToggleQuestion] = useState(null)


    let [toggleQuestionAdd, setToggleQuestionAdd] = useState(false)

    useEffect(() => {
        dispatch(fetchQuiz(quiz_id))
    }, [])


    const showQuestion = (id) => {
        setToggleQuestion(id)
    }

    return (

        <form
            className="flex flex-col justify-center items-center font-sans p-6 md:p-10 bg-gray-900 min-h-screen text-white rounded-lg shadow-2xl space-y-8"
            onSubmit={(e) => {
                e.preventDefault();
                dispatch(updateQuiz({ quiz : quizData, questions : questionsData, choices: choicesData}));
            }}
        >
            <div className="flex flex-col w-full max-w-2xl space-y-6">
                <div className="flex flex-col space-y-2">
                    <label className="text-lg font-semibold text-indigo-300">
                        Quiz Title:
                    </label>
                    <input
                        type="text"
                        onChange={(e) => dispatch(updateQuizName(e.target.value))}
                        value={quizData.name}
                        className="p-3 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <label className="text-lg font-semibold text-indigo-300">
                        Quiz Description:
                    </label>
                    <textarea
                        rows="5"
                        cols="50"
                        onChange={(e) => dispatch(updateQuizDescription(e.target.value))}
                        value={quizData.description}
                        className="resize-none p-3 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
                    ></textarea>
                </div>
            </div>

            ---

            {Object.keys(questionsData).map((questionId) => (
                <QuestionItem
                    key={questionId}
                    question={questionsData[questionId]}
                    questionId={questionId}
                    selected={toggleQuestion === questionId}
                    showQuestion={showQuestion}
                />
            ))}


            {toggleQuestionAdd ? 
                <UpdateAddNewQuestion />
                : null
            }

            ---

            < div className="flex flex-col w-full max-w-2xl space-y-4 pt-6 border-t border-gray-700" >
                <button
                    onClick={() => setToggleQuestionAdd(true)}
                    type="button"
                    className="w-full p-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition duration-150 shadow-xl"
                >
                    Add another Question
                </button>

                <button
                    type="submit"
                    className="w-full p-3 font-extrabold text-gray-900 bg-indigo-400 rounded-lg hover:bg-indigo-300 transition duration-150 shadow-2xl cursor-pointer"
                > Save Quiz </button>
            </div >
        </form >
    )

}

export default UpdateQuiz;