import CreateQuiz from '../components/quizzes/createQuiz'
import AddQuestions from '../components/quizzes/AddQuestions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../features/courses/coursesSlice'
import { addQuiz } from '../features/quizzes/quizSlice'

import { SubmitButton, ManyInputs } from '../components/Reusable_components'

const createQuizPage = () => {


    const [section, setSection] = useState('quiz')
    const coursesList = useSelector(state => state.courses.courses)
    const dispatch = useDispatch() 


    const [quizData, setQuizData] = useState({
        name: "",
        description: "",
        course: null,
        questions : []
    })

    const [question, setQuestion] = useState({
        question_text : '',
        question_type : 'multiple_choices',
        choices : []
    })

    const [questionChoice, setQuestionChoice] = useState({choice: ""})


    useEffect(()=>{
        dispatch(fetchCourses())
    }, [])

    const handleAdd = (state, k, v, setter) => {

        if(Array.isArray(state[k])){
            setter(prev => ({
                ...prev,
                [k] : [...prev[k], v]
            }))
        }else {
            setter(prev =>({
                ...prev,
                [k] : v
            }))
        }

        console.log(state)
    }

    const handleChoice = (v) => {
        setQuestionChoice({
            choice : v
        })
    }

    const addChoicetoQuestion = () => {

        setQuestion(prev => ({
            ...prev,
            choices : [...prev.choices, questionChoice]
        }))

        setQuestionChoice({choice : ''})

        console.log(question)

    }


    const addQuestiontoQuiz = () => {
        
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, question]
        }))

        console.log(quizData)
        alert('Your Question has been added sucessfully')
        setQuestion({
            question_text : '',
            question_type : 'multiple_choices',
            choices : []

        })
        
    }

    const handleSubmit = () =>{
        dispatch(addQuiz(quizData))
    }
    return (

        <>
        {
            section === 'quiz' ?         
            
            <CreateQuiz quizData={quizData} coursesList={coursesList} setter={setQuizData} handleChange={handleAdd} toggleNext={setSection} />
            : 
            <AddQuestions question={question} choice={questionChoice} setter={setQuestion} handleChange={handleAdd} handleChoice={handleChoice} handleSave={addQuestiontoQuiz} addChoice={addChoicetoQuestion} handleSubmit={handleSubmit} />
        }
        
        </>

    )

}

export default createQuizPage;