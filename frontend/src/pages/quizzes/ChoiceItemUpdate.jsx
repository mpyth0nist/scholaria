import { useDispatch } from "react-redux";

function ChoiceItemUpdate({ choice, questionId, choiceId, deleteChoice, updateChoiceData}) {

    const dispatch = useDispatch()
    return (
        <div>
            <input
                type="text"
                value={choice.choice}
                onChange={(e) => dispatch(updateChoiceData({id: choiceId, choice: e.target.value}))}
                className="flex-grow p-2 text-white bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
                onClick={(e) => e.stopPropagation()}
            />
            <button
                type="button" 
                onClick={(e) => {
                    e.stopPropagation();
                    dispatch(deleteChoice({questionId : questionId, choiceId: choiceId}));
                }}
                className="p-2 text-sm text-red-400 hover:text-red-500 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-150"
            >
                Delete
            </button>
        </div>
    )
}

export default ChoiceItemUpdate;
