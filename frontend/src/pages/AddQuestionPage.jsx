import { useState } from "react"
import { AddQuestions } from "../components/quizzes/AddQuestions"
const QuestionPhase = (quiz) => {
    
    const [selected, setSelected] = useState('Multi Choices')

    const [question, setQuestion] = useState({
        questionText : '',
        question_type : '',
        quiz : null
    })

    const handleChange = (k, v) => {
        setQuestion(prev => ({
            ...prev,
            [k] : v
        }))
    }

    const handleSubmit = () => {

    }

    const handleSelection = (option) => {
        setSelected(option)
    }
    
    return (
        <AddQuestions selection={selected} questionText={question.questionText} handleSelection={handleSelection} />
    )






}