import { useDispatch, useSelector } from "react-redux"

const UpdateQuiz = () =>{

    let quizData = useSelector(state => state.quizzes.currentQuiz)
    const dispatch = useDispatch()

    const [updatedQuiz, setUpdatedQuiz] = useState(quizData)


    const updateQuizData = () => {

    }

    const updateQuestionData = (k, v) => {
    }

    const updateChoiceData = (k, v) => {

    }










}