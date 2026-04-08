import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api'


export const fetchQuizzes = createAsyncThunk("fetchQuizzes", async () => {
    const res = await api.get('api/quizzes/list/')
    return res.data
})

export const fetchQuiz = createAsyncThunk("fetchQuiz", async (quizId) => {
    const res = await api.get(`api/quizzes/${quizId}/`)
    return res.data[0]
})

export const addQuiz = createAsyncThunk("addQuiz", async (quiz, { rejectWithValue }) => {
    try {
        const res = await api.post('api/quizzes/create_quiz/', quiz)
        return res.data
    } catch (err) {
        console.error('❌ Quiz create error:', err.response?.status, JSON.stringify(err.response?.data, null, 2))
        return rejectWithValue(err.response?.data)
    }
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
        const res = await api.patch(`api/quizzes/update_quiz/${quiz.id}/`, quiz)
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

// ── Quiz-taking lifecycle thunks ────────────────────────────
export const startAttempt = createAsyncThunk("startAttempt", async (quizId) => {

    try {
        const res = await api.post(`api/quizzes/${quizId}/start/`)
        return res.data // returns the UserAttempt object { id, quiz, student, score, answers }
    } catch (error) {
        console.error({ message: error })
        throw error
    }
})

export const submitAnswer = createAsyncThunk("submitAnswer", async ({ attemptId, questionId, chosenChoices }) => {
    const res = await api.post(
        `api/quizzes/attempts/${attemptId}/questions/${questionId}/answer/`,
        { chosen_choices: chosenChoices }
    )
    return res.data
})

export const submitQuiz = createAsyncThunk("submitQuiz", async (attemptId) => {
    const res = await api.patch(`api/quizzes/attempts/${attemptId}/submit/`, {})
    return res.data // returns the updated UserAttempt with score populated
})

export const cancelAttempt = createAsyncThunk("cancelAttempt", async (attemptId) => {
    await api.delete(`api/quizzes/attempts/${attemptId}/cancel/`)
    return attemptId
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
        due_date: '',
        questions: []
    },
    newQuestion: {
        question_text: '',
        choices: []
    },
    newChoice: { choice: '', is_correct: false },

    loading: false,
    error: false,
    // ── active attempt (while student is taking a quiz) ────────────
    activeAttempt: null,   // { id, quiz, student, score, answers }
    attemptLoading: false,
    submitResult: null,    // the graded attempt returned after submitQuiz
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
        setNewChoiceIsCorrect(state, action) {
            state.newChoice.is_correct = action.payload
        },
        addChoiceToNewQuestion(state) {
            if (!state.newChoice.choice.trim()) return
            state.newQuestion.choices.push({
                choice: state.newChoice.choice,
                is_correct: state.newChoice.is_correct
            })
            state.newChoice = { choice: '', is_correct: false }
        },
        addQuestionToNewQuiz(state) {
            state.newQuiz.questions.push({ ...state.newQuestion })
            state.newQuestion = { question_text: '', choices: [] }
        },
        resetNewQuiz(state) {
            state.newQuiz = { name: '', description: '', course: null, due_date: '', questions: [] }
            state.newQuestion = { question_text: '', choices: [] }
            state.newChoice = { choice: '', is_correct: false }
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

        // ── startAttempt ──
        builder.addCase(startAttempt.pending, (state) => { state.attemptLoading = true })
        builder.addCase(startAttempt.fulfilled, (state, action) => {
            state.activeAttempt = action.payload
            state.attemptLoading = false
        })
        builder.addCase(startAttempt.rejected, (state) => { state.attemptLoading = false })

        // ── submitQuiz ──
        builder.addCase(submitQuiz.pending, (state) => { state.attemptLoading = true })
        builder.addCase(submitQuiz.fulfilled, (state, action) => {
            state.submitResult = action.payload
            state.activeAttempt = null
            state.attemptLoading = false
        })
        builder.addCase(submitQuiz.rejected, (state) => { state.attemptLoading = false })

        // ── cancelAttempt ──
        builder.addCase(cancelAttempt.fulfilled, (state) => {
            state.activeAttempt = null
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
    setNewChoiceIsCorrect,
    addChoiceToNewQuestion,
    addQuestionToNewQuiz,
    resetNewQuiz
} = quizSlice.actions

// async thunks are already exported at declaration
export default quizSlice.reducer