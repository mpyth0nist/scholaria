import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api'


export const fetchQuizzes = createAsyncThunk("fetchQuizzes", async () => {
    const res = await api.get('api/quizzes/list/')
    return res.data
})

export const fetchQuiz = createAsyncThunk("fetchQuiz", async (quizId) => {
    const res = await api.get(`api/quizzes/${quizId}`)
    return res.data[0]
})

export const addQuiz = createAsyncThunk("addQuiz", async (quiz) => {
    const res = await api.post('api/quizzes/create_quiz/', quiz)
    return res.data
})

export const updateQuiz = createAsyncThunk("updateQuiz", async (state) => {
    const quiz = {
        id: state.quiz.id,
        name: state.quiz.name,
        course: state.quiz.course,
        description: state.quiz.description,
        questions: Object.values(state.questions).map(question => ({
            question_text: question.question_text,
            question_type: question.question_type,
            choices: Object.values(state.choices).filter(choice =>
                question.choicesIds.includes(choice.id)
            )
        }))
    }

    try {
        const res = await api.put(`api/quizzes/update_quiz/${quiz.id}/`, quiz)
        return res.data  // fix: was outside try block → res was not defined
    } catch (error) {
        console.error({ message: error })
        throw error
    }
})

export const deleteQuiz = createAsyncThunk("deleteQuiz", async (id) => {
    const res = await api.delete(`api/quizzes/delete_quiz/${id}/`)
    return res.data
})


const initialState = {
    // ── list view ──────────────────────────────────────────────
    quizzes: [],

    // ── current quiz being viewed / updated ────────────────────
    currentQuiz: { id: null, name: '', description: '', course: '', questionsIds: [] },
    currentQuizQuestions: {},
    currentQuizChoices: {},

    // ── new-quiz draft (used by CreateQuizPage) ────────────────
    newQuiz: {
        name: '',
        description: '',
        course: null,
        questions: []
    },
    newQuestion: {
        question_text: '',
        question_type: 'multiple_choices',
        choices: []
    },
    newChoice: { choice: '' },

    loading: false,
    error: false
}

const quizSlice = createSlice({
    name: "quiz",
    initialState,
    reducers: {
        // ── existing update-quiz reducers ──────────────────────
        updateQuizName(state, action) {
            state.currentQuiz.name = action.payload
        },
        updateQuizDescription(state, action) {
            state.currentQuiz.description = action.payload
        },
        addQuestion(state, action) {
            const questionId = action.payload.id
            state.currentQuiz.questionsIds.push(questionId)
            state.currentQuizQuestions[questionId] = {
                question_text: action.payload.question_text,
                question_type: action.payload.question_type,
                choicesIds: action.payload.choicesIds
            }
        },
        deleteQuestion(state, action) {
            const id = action.payload.id
            state.currentQuizQuestions[id].choicesIds.forEach(choiceId => {
                delete state.currentQuizChoices[choiceId]
            })
            delete state.currentQuizQuestions[id]
            state.currentQuiz.questionsIds = state.currentQuiz.questionsIds.filter(
                questionId => questionId !== id
            )
        },
        updateQuestionText(state, action) {
            const id = action.payload.id
            state.currentQuizQuestions[id].question_text = action.payload.question_text
        },
        updateChoice(state, action) {
            const choiceId = action.payload.id
            state.currentQuizChoices[choiceId].choice = action.payload.choice
        },
        deleteChoice(state, action) {
            const choiceId = action.payload.choiceId
            const questionId = action.payload.questionId
            delete state.currentQuizChoices[choiceId]
            state.currentQuizQuestions[questionId].choicesIds =
                state.currentQuizQuestions[questionId].choicesIds.filter(id => choiceId !== id)
        },
        addChoice(state, action) {
            const choiceId = action.payload.id
            state.currentQuizChoices[choiceId] = { id: choiceId, choice: action.payload.choice }
        },

        // ── new-quiz draft reducers (CreateQuizPage) ───────────
        setNewQuizField(state, action) {
            // action.payload = { field: 'name' | 'description' | 'course', value }
            state.newQuiz[action.payload.field] = action.payload.value
        },
        setNewQuestionField(state, action) {
            // action.payload = { field: 'question_text' | 'question_type', value }
            state.newQuestion[action.payload.field] = action.payload.value
        },
        setNewChoiceText(state, action) {
            state.newChoice.choice = action.payload
        },
        addChoiceToNewQuestion(state) {
            if (!state.newChoice.choice.trim()) return
            state.newQuestion.choices.push({ choice: state.newChoice.choice })
            state.newChoice.choice = ''
        },
        addQuestionToNewQuiz(state) {
            state.newQuiz.questions.push({ ...state.newQuestion })
            state.newQuestion = { question_text: '', question_type: 'multiple_choices', choices: [] }
        },
        resetNewQuiz(state) {
            state.newQuiz = { name: '', description: '', course: null, questions: [] }
            state.newQuestion = { question_text: '', question_type: 'multiple_choices', choices: [] }
            state.newChoice = { choice: '' }
        }
    },

    extraReducers: (builder) => {
        builder.addCase(fetchQuizzes.fulfilled, (state, action) => {
            state.quizzes = action.payload
            state.loading = false
            state.error = false
        })
        builder.addCase(fetchQuizzes.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchQuizzes.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(fetchQuiz.pending, (state) => {
            state.loading = true
            // Reset stale data so the old quiz doesn't flash on screen
            state.currentQuiz = { id: null, name: '', description: '', course: '', questionsIds: [] }
            state.currentQuizQuestions = {}
            state.currentQuizChoices = {}
        })
        builder.addCase(fetchQuiz.fulfilled, (state, action) => {
            state.currentQuiz.id = action.payload.id
            state.currentQuiz.name = action.payload.name
            state.currentQuiz.description = action.payload.description
            state.currentQuiz.course = action.payload.course
            action.payload.questions.forEach((question) => {
                state.currentQuiz.questionsIds.push(question.id)
                state.currentQuizQuestions[question.id] = {
                    question_text: question.question_text,
                    question_type: question.question_type,
                    choicesIds: []
                }
                question.choices.forEach(choice => {
                    state.currentQuizQuestions[question.id].choicesIds.push(choice.id)
                    state.currentQuizChoices[choice.id] = choice
                })
            })
            state.loading = false
        })
        builder.addCase(fetchQuiz.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(addQuiz.fulfilled, (state, action) => {
            state.quizzes.push(action.payload)
            state.loading = false
        })
        builder.addCase(addQuiz.pending, (state) => {
            state.loading = true
        })
        builder.addCase(addQuiz.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(updateQuiz.fulfilled, (state) => {
            state.error = false
            state.loading = false
        })
        builder.addCase(updateQuiz.pending, (state) => {
            state.loading = true
        })
        builder.addCase(updateQuiz.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(deleteQuiz.fulfilled, (state, action) => {
            state.quizzes = state.quizzes.filter(quiz => quiz.id !== action.payload.id)
            state.error = false
            state.loading = false
        })
        builder.addCase(deleteQuiz.pending, (state) => {
            state.loading = true
        })
        builder.addCase(deleteQuiz.rejected, (state) => {
            state.error = true
            state.loading = false
        })
    }
})


export const {
    updateQuizName,
    updateQuizDescription,
    addQuestion,
    deleteQuestion,
    updateQuestionText,
    updateChoice,
    deleteChoice,
    addChoice,
    setNewQuizField,
    setNewQuestionField,
    setNewChoiceText,
    addChoiceToNewQuestion,
    addQuestionToNewQuiz,
    resetNewQuiz
} = quizSlice.actions

export default quizSlice.reducer