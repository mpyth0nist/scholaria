import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api'



export const listQuizzes = createAsyncThunk("listQuizzes", async () => {
    const res = await api.get('api/quizzes/list/')

    return res.data
})

export const addQuiz = createAsyncThunk("addQuiz", async (quiz) => {
    const res = await api.post('api/quizzes/create-quiz/', {quiz})
    return res.data
})


const initialState = [{name: "", description:"", courses: [{}]}]
const quizSlice = createSlice(
    {
        name: "quiz",
        initialState,
        reducer:{},

        extraReducers: (builder) => {
            builder.addCase(listQuizzes.fulfilled, (state, action) => {
                state = action.payload
            })

            builder.addCase(listQuizzes.pending, () => {
                console.log("...Loading")
            })

            builder.addCase(listQuizzes.rejected, () => {
                console.log("Something wen't wrong when adding the quiz")
            })

            builder.addCase(addQuiz.fulfilled, (state, action) => {
                console.log("quiz created : ", action.payload)

            })

            builder.addCase(addQuiz.pending, () => {
                console.log("...loading")
            })

            builder.addCase(addQuiz.rejected, () => {
                console.log("Something went wrong when creating your quiz!")
            })
        }

    }
)

export default quizSlice.reducer;