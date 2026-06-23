import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api'

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAssignments = createAsyncThunk('assignments/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('api/quizzes/assignments/')
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const fetchAssignment = createAsyncThunk('assignments/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const res = await api.get(`api/quizzes/assignments/${id}/`)
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const createAssignment = createAsyncThunk('assignments/create', async (formData, { rejectWithValue }) => {
    try {
        const res = await api.post('api/quizzes/assignments/create/', formData)
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const updateAssignment = createAsyncThunk('assignments/update', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const res = await api.patch(`api/quizzes/assignments/${id}/update/`, formData)
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const deleteAssignment = createAsyncThunk('assignments/delete', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`api/quizzes/assignments/${id}/delete/`)
        return id
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const submitAssignment = createAsyncThunk('assignments/submit', async ({ assignmentId, formData }, { rejectWithValue }) => {
    try {
        const res = await api.post(`api/quizzes/assignments/${assignmentId}/submit/`, formData)
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const gradeSubmission = createAsyncThunk('assignments/grade', async ({ submissionId, score, feedback }, { rejectWithValue }) => {
    try {
        const res = await api.patch(`api/quizzes/submissions/${submissionId}/grade/`, { score, feedback })
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

// ── Slice ─────────────────────────────────────────────────────────────────────

const assignmentSlice = createSlice({
    name: 'assignments',
    initialState: {
        assignments: [],
        currentAssignment: null,
        loading: false,
        error: null,
        submitSuccess: false,
        gradeSuccess: false,
    },
    reducers: {
        clearSubmitSuccess(state) { state.submitSuccess = false },
        clearGradeSuccess(state) { state.gradeSuccess = false },
        clearError(state) { state.error = null },
    },
    extraReducers: (builder) => {
        // fetchAssignments
        builder
            .addCase(fetchAssignments.pending, (state) => { state.loading = true; state.error = null })
            .addCase(fetchAssignments.fulfilled, (state, action) => { state.loading = false; state.assignments = action.payload })
            .addCase(fetchAssignments.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        // fetchAssignment
        builder
            .addCase(fetchAssignment.pending, (state) => { state.loading = true; state.error = null; state.currentAssignment = null })
            .addCase(fetchAssignment.fulfilled, (state, action) => { state.loading = false; state.currentAssignment = action.payload })
            .addCase(fetchAssignment.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        // createAssignment
        builder
            .addCase(createAssignment.pending, (state) => { state.loading = true; state.error = null })
            .addCase(createAssignment.fulfilled, (state, action) => { state.loading = false; state.assignments.push(action.payload) })
            .addCase(createAssignment.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        // updateAssignment
        builder
            .addCase(updateAssignment.pending, (state) => { state.loading = true; state.error = null })
            .addCase(updateAssignment.fulfilled, (state, action) => {
                state.loading = false
                const idx = state.assignments.findIndex(a => a.id === action.payload.id)
                if (idx !== -1) state.assignments[idx] = action.payload
                if (state.currentAssignment?.id === action.payload.id) state.currentAssignment = action.payload
            })
            .addCase(updateAssignment.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        // deleteAssignment
        builder
            .addCase(deleteAssignment.pending, (state) => { state.loading = true })
            .addCase(deleteAssignment.fulfilled, (state, action) => {
                state.loading = false
                state.assignments = state.assignments.filter(a => a.id !== action.payload)
            })
            .addCase(deleteAssignment.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        // submitAssignment
        builder
            .addCase(submitAssignment.pending, (state) => { state.loading = true; state.error = null; state.submitSuccess = false })
            .addCase(submitAssignment.fulfilled, (state, action) => {
                state.loading = false
                state.submitSuccess = true
                // Update my_submission in currentAssignment if present
                if (state.currentAssignment) {
                    state.currentAssignment.my_submission = action.payload
                }
            })
            .addCase(submitAssignment.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        // gradeSubmission
        builder
            .addCase(gradeSubmission.pending, (state) => { state.loading = true; state.error = null; state.gradeSuccess = false })
            .addCase(gradeSubmission.fulfilled, (state, action) => {
                state.loading = false
                state.gradeSuccess = true
                // Patch the submission inside currentAssignment.submissions
                if (state.currentAssignment?.submissions) {
                    const idx = state.currentAssignment.submissions.findIndex(s => s.id === action.payload.id)
                    if (idx !== -1) {
                        state.currentAssignment.submissions[idx] = {
                            ...state.currentAssignment.submissions[idx],
                            ...action.payload,
                        }
                    }
                }
            })
            .addCase(gradeSubmission.rejected, (state, action) => { state.loading = false; state.error = action.payload })
    }
})

export const { clearSubmitSuccess, clearGradeSuccess, clearError } = assignmentSlice.actions
export default assignmentSlice.reducer
