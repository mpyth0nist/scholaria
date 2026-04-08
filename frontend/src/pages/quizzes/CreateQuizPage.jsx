import CreateQuiz from './createQuiz'
import AddQuestions from './AddQuestions'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../../features/courses/coursesSlice'
import { addQuiz, resetNewQuiz, setNewQuizField, setNewQuestionField, setNewChoiceText, setNewChoiceIsCorrect, addChoiceToNewQuestion, addQuestionToNewQuiz } from '../../features/quizzes/quizSlice'

const CreateQuizPage = () => {

    // ── UI-only local state (section toggle is genuinely ephemeral) ──
    const [section, setSection] = useState('quiz')

    const dispatch = useDispatch()

    // ── Redux state ──────────────────────────────────────────────────
    const coursesList = useSelector(state => state.courses.courses)
    const quizData    = useSelector(state => state.quizzes.newQuiz)
    const question    = useSelector(state => state.quizzes.newQuestion)
    const choice      = useSelector(state => state.quizzes.newChoice)

    useEffect(() => {
        dispatch(fetchCourses())
        // Clean up any stale draft when the page unmounts
        return () => { dispatch(resetNewQuiz()) }
    }, [])

    // ── Handlers ─────────────────────────────────────────────────────
    const handleQuizFieldChange = (field, value) => {
        dispatch(setNewQuizField({ field, value }))
    }

    const handleQuestionFieldChange = (field, value) => {
        dispatch(setNewQuestionField({ field, value }))
    }

    const handleChoiceChange = (value) => {
        dispatch(setNewChoiceText(value))
    }

    const handleChoiceIsCorrectChange = (value) => {
        dispatch(setNewChoiceIsCorrect(value))
    }

    const addChoiceToQuestion = () => {
        dispatch(addChoiceToNewQuestion())
    }

    const addQuestionToQuiz = () => {
        dispatch(addQuestionToNewQuiz())
        alert('Your question has been added successfully')
    }

    const handleSubmit = () => {
        dispatch(addQuiz(quizData))
        dispatch(resetNewQuiz())
    }

    return (
        <>
            {section === 'quiz' ? (
                <CreateQuiz
                    quizData={quizData}
                    coursesList={coursesList}
                    handleQuizFieldChange={handleQuizFieldChange}
                    toggleNext={setSection}
                />
            ) : (
                <AddQuestions
                    question={question}
                    choice={choice}
                    quizData={quizData}
                    handleQuestionFieldChange={handleQuestionFieldChange}
                    handleChoiceChange={handleChoiceChange}
                    handleChoiceIsCorrectChange={handleChoiceIsCorrectChange}
                    handleSave={addQuestionToQuiz}
                    addChoice={addChoiceToQuestion}
                    handleSubmit={handleSubmit}
                />
            )}
        </>
    )
}

export default CreateQuizPage