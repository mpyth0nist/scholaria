
import { addQuestion } from "../../features/quizzes/quizSlice"
import { useEffect, useState } from 'react'
import UpdateAddNewChoice from "./UpdateAddNewChoice"
import { useDispatch } from "react-redux"
import { v4 as uuidv4 } from 'uuid'
import { useSelector } from "react-redux"


function UpdateAddNewQuestion(props) {

    const choices = useSelector(state => state.quizzes.currentQuizChoices)
    const dispatch = useDispatch()

    const [newQuestion, setNewQuestion] = useState({
        id : uuidv4(),
        question_text : '',
        question_type : '',
        choicesIds : []
    })


    useEffect(() => {
        console.log(newQuestion)
    }, [newQuestion])

    useEffect(() => {
        console.log('CHOICES ARE : ', choices)
    }, [choices])

    const handleAddQuestion = () => {
        dispatch(addQuestion(newQuestion))

        const nextId = uuidv4();

        setNewQuestion({
            id : nextId,
            question_text : '',
            question_type : '',
            choicesIds : []
        })

    }




    return (
        <div className="w-full max-w-2xl p-6 bg-indigo-900/50 border border-indigo-700 rounded-xl shadow-2xl space-y-4">
            {/* New Question Input */}
            <input
                type="text"
                placeholder="New Question..."
                value={newQuestion.question_text}
                className="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition duration-150"
                onChange={(e) =>
                    setNewQuestion((prev) => ({
                        ...prev,
                        question_text: e.target.value,
                    }))
                }
            />
            {/* Question Type Select */}
            <select
                value={newQuestion.question_type}
                onChange={(e) =>
                    setNewQuestion((prev) => ({
                        ...prev,
                        question_type: e.target.value,
                    }))
                }
                className="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition duration-150 appearance-none cursor-pointer"
            >
                <option value="multiple_choices">Multi Choices</option>
                <option value="true_false">True/False</option>
            </select>

            {/* { !toggleChoices && newQuestion.question_type === 'multiple_choices' ? <button type="button" onClick={() => {
                setToggleChoices(true)
                dispatch(addQuestion(newQuestion))

            }}>Add Choices</button>
            : null} */}

            {newQuestion.choicesIds.map(id => {
                return <p>{choices[id].choice}</p>
            })}

            {newQuestion.question_type === 'multiple_choices' ? 
                <UpdateAddNewChoice updateNewQuestionData={setNewQuestion}/> :
                null
            }

            <button type="button" onClick={handleAddQuestion}>Save new question</button>
        </div>
    )
}

export default UpdateAddNewQuestion;