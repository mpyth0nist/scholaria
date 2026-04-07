import { useSelector, useDispatch } from "react-redux"
import { fetchQuizzes, deleteQuiz } from "../../features/quizzes/quizSlice"
import { fetchUser } from "../../features/users/userSlice"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const QuizList = () => {

    const quizzes = useSelector(state => state.quizzes.quizzes)
    const userData = useSelector(state => state.users.user)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchQuizzes())
        dispatch(fetchUser())
    }, [])

    const navigate = useNavigate()

    return(
        <div className="border-[2px] border-green-600 p-[1rem] m-[1rem]">
            {
                quizzes.map(quiz => {
                    return (

                        <>
                            {
                                userData.role === 'Teacher' ? 
                            
                                    <div className="flex bg-[#ecf0f1] text-black w-[600px] text-center border-[#bdc3c7] shadow-md p-[1rem] m-[0.5rem] items-center">
                                        
                                        <p className="basis-[70%] size-fit m-0 p-0"  onClick={() => navigate(`/quizzes/${quiz.id}`)} >{quiz.name}</p>
                                        <button className="text-white m-[5px]" onClick={() => navigate(`/quizzes/update-quiz/${quiz.id}`)}>Edit</button>
                                        <button className="text-white m-[5px]" onClick={() => dispatch(deleteQuiz(quiz.id))}>Delete</button>
                                    </div>

                                
                                
                                : <div className="bg-[#ecf0f1] text-black w-[600px] text-center border-[#bdc3c7] shadow-md p-[1rem] m-[0.5rem]" onClick={() => navigate(`/quizzes/${quiz.id}`)}>{quiz.name}</div>
                            }
                        </>


                
                    )
                })
            }
        </div>
    )

}

export default QuizList;
