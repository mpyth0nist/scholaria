import { useDispatch, useSelector } from "react-redux"
import { fetchQuiz, updateQuiz } from "../../features/quizzes/quizSlice"
import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
const UpdateQuiz = () =>{

    let quizData = useSelector(state => state.quizzes.currentQuiz)

    console.log(quizData)
    const {quiz_id} = useParams()
    const dispatch = useDispatch()

    let [updatedQuiz, setUpdatedQuiz] = useState(null)

    let [toggleQuestion, setToggleQuestion] = useState(null)
    
    let [newQuestion, setNewQuestion] = useState({
        question_text: '',
        question_type : 'multiple_choices',
        choices : []
    })

    let [newQuestionChoice, setNewQuestionChoice] = useState(null)

    let [toggleQuestionAdd, setToggleQuestionAdd] = useState(false)

    useEffect(() => {
        dispatch(fetchQuiz(quiz_id))
    }, [])

    useEffect(() => {
        setUpdatedQuiz(quizData)
        console.log(quizData)
        console.log(updatedQuiz)
    }, [quizData])
    
    useEffect(() => {
        console.log(updatedQuiz)
    }, [updatedQuiz])

    useEffect(() => {
        console.log('New Question data: ', newQuestion)
    }, [newQuestion])

    const updateQuizData = (k, v) => {
        setUpdatedQuiz(prev => ({...prev,
            [k] : v
        }))
    }

    const updateQuestionData = (k, v) => {
        setUpdatedQuiz(prev => ({...prev,
            questions : prev.questions.map(question => {

                if(question.id === k){
                    return {
                        ...question,
                        question_text : v
                    }
                }else {

                    return question
                }
    })}))
    }

    const addNewQuestion = ( questionData) => {

        setUpdatedQuiz(prev => ({
            ...prev,
            questions : [...prev.questions, questionData]
        }))
    }

    const deleteQuestion = (question) => {
        setUpdatedQuiz(prev => ({
            ...prev,
            questions : prev.questions.filter(q => q !== question)
        }))
    }

    const updateChoiceData = (question_id, choice_id, v) => {


        setUpdatedQuiz(prev => ({
            ...prev,

            questions : prev.questions.map(question => {
                if(question.id === question_id){
                    return {
                        ...question,
                        
                        choices : question.choices.map(element => {
                        if (element.id === choice_id){
                            return {
                                ...element,
                                choice : v
                            }
                    
                        }else {
                            return element
                        }
                    
                })
            }}
            
            else {
                return question
            }
            })
        }))

    }

    const deleteChoice = (question_id, choice_id) => {
        setUpdatedQuiz(prev => ({
            ...prev,
            questions : prev.questions.map(question => {
                if(question.id === question_id){
                    return{
                        ...question,
                        choices : question.choices.filter(choice => choice.id !== choice_id)
                    }
                }

                return question
            })
        }))
    }

    return (

        <form className="flex flex-col justify-center flex-wrap items-center text-white font-medium p-4" onSubmit={(e) => {
                e.preventDefault()
                dispatch(updateQuiz(updatedQuiz))}}>

            <div className="flex flex-col">
                <label>Quiz Title: </label>
                <input type="text" onChange={(e) => updateQuizData('name', e.target.value)} value={updatedQuiz?.name} className="m-4 p-4 text-white font-medium border rounded" />

                <label>Quiz Description: </label>
                <textarea rows="5" cols="50" onChange={(e) => updateQuizData('description', e.target.value)} value={updatedQuiz?.description} className="resize-none m-4 p-4 text-white font-medium text-sm border rounded" > </textarea>

            </div>


            { updatedQuiz?.questions.map(question => {
                return <div type="button" onClick={() => setToggleQuestion(question.question_text)} value={question.question_text}>
                    {question.question_text}
                    <ChevronDown />
                    {
                        toggleQuestion === question.question_text ? 
                        <>
                            <input type="text" value={question.question_text} onChange={(e) => updateQuestionData(question.id, e.target.value)} className="p-4 text-white font-medium border rounded" />
                            {question.choices.map(choice =>{
                                return (
                                    <>
                                        <input type="text" value={choice.choice} onChange={(e) => updateChoiceData(question.id, choice.id, e.target.value)  } className="p-4 text-white font-medium border rounded" />
                                        <button type="reset" onClick={() => deleteChoice(question.id, choice.id)}>Delete Choice</button>
                                    </>
                                )

                            })}


                        </>
                         : null
                    }

                    <button type="button" onClick={() => deleteQuestion(question)}>Delete Question</button>
                </div>
            })}
            {
                toggleQuestionAdd ? 
                    <div>
                        <input type="text" placeholder="Question..." value={newQuestion.question_text} className="m-4 p-4 text-white font-medium border rounded" onChange={(e) => setNewQuestion(prev => ({
                            ...prev,
                            question_text : e.target.value
                        }))} />
                        <select value={newQuestion.question_type} onChange={(e) => setNewQuestion(prev => ({...prev, 
                            question_type : e.target.value
                        })) }>
                            <option value="multiple_choices">Multi Choices</option>
                            <option value="true_false">True/False</option>
                        </select> 

                        <div>
                            { newQuestion?.question_type === 'multiple_choices' ? 
                                <div>
                                    <input className="m-4 p-4 text-white font-medium border rounded" type="text" value={newQuestionChoice} onChange={(e) => setNewQuestionChoice(e.target.value)}/>
                                    <button type="reset" onClick={() => {
                                        setNewQuestion(prev => ({
                                            ...prev,
                                            choices : [...prev.choices, newQuestionChoice]
                                        }))
                                        setNewQuestionChoice('')} }>Add Choice</button>
                                </div>

                                : null
                                
                            }
                        </div>

                        <button type='button' onClick={() => addNewQuestion(newQuestion)}>Add Question</button>                       
                    </div>

                    :
                    null
            }

            <button onClick={() => setToggleQuestionAdd(true)} type="button">Add another Question</button>
            <input type="submit" />
        </form>

    )

}

export default UpdateQuiz;