import { useSelector, useDispatch } from "react-redux"
import { fetchQuizzes } from "../../features/quizzes/quizSlice"
import { useEffect } from "react"

const QuizList = () => {

    const quizzes = useSelector(state => state.quizzes.quizzes)
    const dispatch = useDispatch()
    useEffect(() => {
        console.log(quizzes)
        dispatch(fetchQuizzes())
    }, [])


    return(
        <div className="border-[2px] border-green-600 p-[1rem] m-[1rem]">
            {
                quizzes.map(quiz => {
                    return <div className="bg-[#ecf0f1] text-black w-[600px] text-center border-[#bdc3c7] shadow-md p-[1rem] m-[0.5rem]">{quiz.name}</div>
                })
            }
        </div>
    )

}

export default QuizList;
