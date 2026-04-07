import { ChevronDown } from "lucide-react"
import ChoiceItemUpdate from "./ChoiceItemUpdate";
import { useDispatch, useSelector } from "react-redux";
import { updateQuestionText, updateChoice, deleteChoice, deleteQuestion } from "../../features/quizzes/quizSlice";

function QuestionItem({ questionId, showQuestion, question, selected }) {

    let choicesData = useSelector(state => state.quizzes.currentQuizChoices)
    const dispatch = useDispatch()

    return (
        <div
            onClick={() => showQuestion(questionId)}
            className="w-full max-w-2xl p-4 bg-gray-800 rounded-xl shadow-xl cursor-pointer hover:bg-gray-700 transition duration-200 ease-in-out space-y-3"
        >
            <div className="flex justify-between items-center text-lg font-medium text-cyan-400">
                <span>{question.question_text}</span>
                <ChevronDown className="w-5 h-5 text-indigo-400" />
            </div>

            {selected ? (
                <div className="space-y-4 pt-3 border-t border-gray-700 mt-3">
                    <input
                        type="text"
                        value={question.question_text}
                        onChange={(e) =>
                            dispatch(updateQuestionText({ id: questionId, question_text: e.target.value }))
                        }
                        className="w-full p-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {question.choicesIds.map(id => (
                        <ChoiceItemUpdate
                            key={id}
                            questionId={questionId}
                            choiceId={id}
                            choice={choicesData[id]}
                            question={question}
                            updateChoiceData={updateChoice}
                            deleteChoice={deleteChoice}
                        />
                    ))}
                </div>
            ) : null}

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    dispatch(deleteQuestion({ id: questionId }))
                }}
                className="mt-4 w-full p-2 text-sm font-medium text-red-400 border border-red-500 rounded-lg hover:bg-red-900 transition duration-150"
            >
                Delete Question
            </button>
        </div>
    )
}

export default QuestionItem