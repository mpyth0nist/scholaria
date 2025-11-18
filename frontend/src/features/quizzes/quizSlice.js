import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api'



export const fetchQuizzes = createAsyncThunk("fetchQuizzes", async () => {
    const res = await api.get('api/quizzes/list/')

    return res.data
})


export const fetchQuiz = createAsyncThunk("fetchQuiz", async (quizId) => {
    let res = await api.get(`api/quizzes/${quizId}`)

    return res.data[0]
})
export const addQuiz = createAsyncThunk("addQuiz", async (quiz) => {
    console.log(quiz)
    const res = await api.post('api/quizzes/create_quiz/', quiz)
    return res.data
})

export const updateQuiz = createAsyncThunk("updateQuiz", async (quiz) => {
    const res = await api.put(`api/quizzes/update_quiz/${quiz.id}/`, quiz)

    return res.data
})

export const deleteQuiz = createAsyncThunk("deleteQuiz", async (id) => {
    const res = await api.delete(`api/quizzes/delete_quiz/${id}/`)

    return res.data
})


const initialState = {
    quizzes : [],
    currentQuiz: null,
    loading: false, 
    error: false
}
const quizSlice = createSlice(
    {
        name: "quiz",
        initialState,
        reducer:{},

        extraReducers: (builder) => {



            builder.addCase(fetchQuizzes.fulfilled, (state, action) => {


                state.quizzes = action.payload

                state.loading = false
                state.error = false
            })

            builder.addCase(fetchQuizzes.pending, (state) => {
                state.loading = true
                console.log("...Loading")
            })

            builder.addCase(fetchQuizzes.rejected, (state) => {
                state.error = true
                state.loading = false
                console.log("Something wen't wrong when adding the quiz")
            })


            builder.addCase(fetchQuiz.fulfilled, (state, action) =>{
                
                state.currentQuiz = action.payload
                console.log(action.payload,state.currentQuiz)
                console.log('fetching succeeded')
                state.loading = false

            })

            builder.addCase(fetchQuiz.pending, (state) => {
                state.loading = true
                console.log('loading')
            })


            
            builder.addCase(addQuiz.fulfilled, (state, action) => {
                state.quizzes.push(action.payload)
                state.loading = false
                console.log("quiz created : ", action.payload)

            })

            builder.addCase(addQuiz.pending, (state) => {
                state.loading = true
                console.log("...loading")
            })

            builder.addCase(addQuiz.rejected, (state) => {
                state.error = true
                state.loading = false
                console.log("Something went wrong when creating your quiz!")
            })

            builder.addCase(updateQuiz.fulfilled, (state) => {
                state.error = false;
                state.loading = false;
                console.log('Updated successfully')
            })

            builder.addCase(updateQuiz.pending, (state) => {
                state.loading = true;
            })

            builder.addCase(updateQuiz.rejected, (state) => {
                state.error = true;
                state.loading = false;
            })

            builder.addCase(deleteQuiz.fulfilled, (state, action) => {

                // Removing the deleted quiz from the list of quizzes.
                state.quizzes = state.quizzes.filter(quiz => quiz.id !== action.payload.id)


                state.error = false;
                state.loading = false;
            })

            builder.addCase(deleteQuiz.pending, (state) => {
                state.loading = true;
            })

            builder.addCase(deleteQuiz.rejected, (state) => {
                state.error = true;
            })
        }

        

    }
)



export default quizSlice.reducer;