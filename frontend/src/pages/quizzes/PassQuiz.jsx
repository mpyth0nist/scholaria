import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchQuiz } from "../../features/quizzes/quizSlice"


const PassQuiz = () => {

    const [questionIndex, setQuestionIndex] = useState(0)
    const { quiz_id } = useParams()
    const dispatch = useDispatch()

    const quiz = useSelector(state => state.quizzes.currentQuiz)
    const questions = useSelector(state => state.quizzes.currentQuizQuestions)
    const choices = useSelector(state => state.quizzes.currentQuizChoices)
    const loading = useSelector(state => state.quizzes.loading)

    // Build an ordered array of questions with their choices embedded
    const questionList = (quiz.questionsIds || []).map(qId => ({
        ...questions[qId],
        choices: (questions[qId]?.choicesIds || []).map(cId => choices[cId])
    }))

    useEffect(() => {
        dispatch(fetchQuiz(quiz_id))
    }, [quiz_id])

    if (loading || !quiz.id || questionList.length === 0) {
        return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading quiz...</div>
    }

    const currentQuestion = questionList[questionIndex]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                {/* Question Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Question {questionIndex + 1}
                        <span className="text-gray-400 text-lg ml-2">
                            of {questionList.length}
                        </span>
                    </h3>
                </div>

                {/* Question Text */}
                <div className="mb-8">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        {currentQuestion.question_text}
                    </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
                    {currentQuestion.question_type === 'multiple_choices' ? (
                        currentQuestion.choices.map((element, index) => (
                            <label
                                key={index}
                                className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                            >
                                <input
                                    value={element.choice}
                                    type="radio"
                                    name="answer"
                                    className="w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="ml-3 text-gray-700 font-medium">
                                    {element.choice}
                                </span>
                            </label>
                        ))
                    ) : (
                        <div className="space-y-4">
                            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200">
                                <input
                                    value="True"
                                    type="radio"
                                    name="answer"
                                    className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                                />
                                <span className="ml-3 text-gray-700 font-medium">True</span>
                            </label>
                            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all duration-200">
                                <input
                                    value="False"
                                    type="radio"
                                    name="answer"
                                    className="w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer"
                                />
                                <span className="ml-3 text-gray-700 font-medium">False</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Navigation Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setQuestionIndex(questionIndex + 1)}
                        disabled={questionIndex >= questionList.length - 1}
                        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        {questionIndex >= questionList.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PassQuiz