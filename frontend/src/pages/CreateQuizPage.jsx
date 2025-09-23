import CreateQuiz from '../components/quizzes/createQuiz'
import AddQuestions from '../components/quizzes/AddQuestions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../features/courses/coursesSlice'
import { addQuiz } from '../features/quizzes/quizSlice'

import { SubmitButton } from '../components/Reusable_components'

const createQuizPage = () => {

    const coursesList = useSelector(state => state.courses.courses)
    const dispatch = useDispatch() 
    const [quizData, setQuizData] = useState({
        name: "",
        description: "",
        course: {}
    })

    const [question, setQuestion] = useState({
        questionText : '',
        questionType : 'Multi Choices',
        quiz : null
    })

    useEffect(()=>{
        dispatch(fetchCourses())
    }, [])

    const handleChange = (k, v) => {
        // Takes two arguments :
        // k => key, v => a value for that key

        setQuizData(prev => ({
            ...prev, 
            [k] : v
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(addQuiz(quizData))
    }

    const handleSelection = (option) => {
        setQuestion(prev => ({...prev,
            questionType : option
        }))
    }
    return (
        <form onSubmit={handleSubmit}>

            
            <CreateQuiz quizData={quizData} coursesList={coursesList} handleChange={handleChange} />

            <h2>Quiz's Questions</h2>
            <AddQuestions questionText={question.questionText} selection={question.questionType} handleChange={handleChange} handleSelection={handleSelection} />

            <SubmitButton value="Submit" />

            
            

        </form>
    )

}

export default createQuizPage;