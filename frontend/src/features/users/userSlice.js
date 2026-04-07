import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api'
import { ACCESS_TOKEN } from "../../constants";

const token = localStorage.getItem(ACCESS_TOKEN)

const initialState = {
    isAuthenticated: false,
    user: {},
    students: [],
    studentsCount: 0,
    studentsNext: null,
    studentsPrevious: null,
    studentsLoading: false,
    dashboardMetrics: null,
    dashboardLoading: false,
}

export const fetchUser = createAsyncThunk('fetchUser', async () => {
    const res = await api.get('api/users/user/', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    return res.data
})

export const fetchTeacherDashboard = createAsyncThunk('fetchTeacherDashboard', async () => {
    const res = await api.get('api/users/dashboard/', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    return res.data
})

export const fetchStudents = createAsyncThunk('fetchStudents', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.size) query.append('size', params.size)
    if (params.search) query.append('search', params.search)
    if (params.ordering) query.append('ordering', params.ordering)

    const url = query.toString() ? `api/users/students/?${query.toString()}` : 'api/users/students/'

    const res = await api.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    return res.data
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.isAuthenticated = true
            state.user = action.payload
        })
        builder.addCase(fetchUser.pending, () => {})
        builder.addCase(fetchUser.rejected, () => {})

        builder.addCase(fetchStudents.fulfilled, (state, action) => {
            state.students = action.payload.results || action.payload
            state.studentsCount = action.payload.count || action.payload.length || 0
            state.studentsNext = action.payload.next || null
            state.studentsPrevious = action.payload.previous || null
            state.studentsLoading = false
        })
        builder.addCase(fetchStudents.pending, (state) => {
            state.studentsLoading = true
        })
        builder.addCase(fetchStudents.rejected, (state) => {
            state.studentsLoading = false
        })

        builder.addCase(fetchTeacherDashboard.fulfilled, (state, action) => {
            state.dashboardMetrics = action.payload
            state.dashboardLoading = false
        })
        builder.addCase(fetchTeacherDashboard.pending, (state) => {
            state.dashboardLoading = true
        })
        builder.addCase(fetchTeacherDashboard.rejected, (state) => {
            state.dashboardLoading = false
        })
    }
})

export default userSlice.reducer
