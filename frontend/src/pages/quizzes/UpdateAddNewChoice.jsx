import { addChoice } from "../../features/quizzes/quizSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from 'uuid'
function UpdateAddNewChoice({ updateNewQuestionData }) {

    const dispatch = useDispatch()
    const [newQuestionChoice, setNewQuestionChoice] = useState({
        id : uuidv4(),
        choice: ""
    })

    const handleAddChoice = () => {

        if(!newQuestionChoice.choice.trim()){
            return;
        }

        const nextId = uuidv4();

        setNewQuestionChoice(prev => ({...prev, id: nextId}));

        dispatch(addChoice(newQuestionChoice))

        updateNewQuestionData(prev => ({...prev,
            choicesIds : [...prev.choicesIds, newQuestionChoice.id]
        }))


    }


    return (

        <div className="flex space-x-3 items-center mt-4">

            <input
                className="flex-grow p-3 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500"
                type="text"
                placeholder="Add choice text..."
                value={newQuestionChoice.choice}
                onChange={(e) => setNewQuestionChoice(prev => ({...prev, choice: e.target.value}))}
            />
            <button
                type="button"
                onClick={handleAddChoice}
                // Primary action button style
                className="px-4 py-2 text-white font-medium bg-primary rounded-lg hover:bg-primary transition duration-150 shadow-md"
            >
                Add Choice
            </button>
        </div>
    )
}

export default UpdateAddNewChoice;