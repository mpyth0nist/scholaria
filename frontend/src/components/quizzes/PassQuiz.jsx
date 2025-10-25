import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from '../../api.js'


const PassQuiz = () => {

    const [quiz, setQuiz] = useState(null)
    const [questionIndex, setQuestionIndex] = useState(0)
    let {quiz_id} = useParams()
    

    const getQuiz = async () => {

        const res = await api.get(`api/quizzes/${quiz_id}`)
        console.log(res.data)
        setQuiz(res.data[0])

    }

    useEffect(() => {
        getQuiz()
    }, [])

    useEffect(()=> {
        if (quiz){
            console.log(quiz)
            console.log(quiz.questions[0])
        }

    }, [quiz])

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return <div>Loading quiz...</div>
    }
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            {/* Question Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                    Question {questionIndex + 1}
                    <span className="text-gray-400 text-lg ml-2">
                        of {quiz?.questions?.length || 0}
                    </span>
                </h3>
            </div>

            {/* Question Text */}
            <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                    {quiz?.questions[questionIndex].question_text}
                </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
                {quiz?.questions[questionIndex].question_type === 'multiple_choices' ? 
                    quiz?.questions[questionIndex].choices.map((element, index) => (
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
                    )) : 
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
                }
            </div>

            {/* Navigation Button */}
            <div className="flex justify-end">
                <button 
                    onClick={() => setQuestionIndex(questionIndex + 1)}
                    disabled={questionIndex >= (quiz?.questions?.length || 0) - 1}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                    {questionIndex >= (quiz?.questions?.length || 0) - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    </div>
)

}

export default PassQuiz;