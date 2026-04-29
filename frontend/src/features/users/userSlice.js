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
    
    // Admin state
    adminUsers: [],
    adminUsersCount: 0,
    adminUsersNext: null,
    adminUsersPrevious: null,
    adminUsersLoading: false,
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

// --- Admin Thunks ---
export const fetchAdminUsers = createAsyncThunk('fetchAdminUsers', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.size) query.append('size', params.size)
    if (params.search) query.append('search', params.search)
    if (params.ordering) query.append('ordering', params.ordering)

    const url = query.toString() ? `api/users/admin/list/?${query.toString()}` : 'api/users/admin/list/'
    const res = await api.get(url, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    return res.data
})

export const adminCreateUser = createAsyncThunk('adminCreateUser', async (userData, { rejectWithValue }) => {
    try {
        const res = await api.post('api/users/admin/create/', userData, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const adminUpdateUser = createAsyncThunk('adminUpdateUser', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await api.patch(`api/users/admin/update/${id}/`, data, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        return res.data
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})

export const adminDeleteUser = createAsyncThunk('adminDeleteUser', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`api/users/admin/delete/${id}/`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        return id
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
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

        // --- Admin Reducers ---
        builder.addCase(fetchAdminUsers.pending, (state) => {
            state.adminUsersLoading = true
        })
        builder.addCase(fetchAdminUsers.fulfilled, (state, action) => {
            state.adminUsers = action.payload.results || action.payload
            state.adminUsersCount = action.payload.count || action.payload.length || 0
            state.adminUsersNext = action.payload.next || null
            state.adminUsersPrevious = action.payload.previous || null
            state.adminUsersLoading = false
        })
        builder.addCase(fetchAdminUsers.rejected, (state) => {
            state.adminUsersLoading = false
        })

        builder.addCase(adminCreateUser.fulfilled, (state, action) => {
            // Unshift new user to the top
            state.adminUsers.unshift(action.payload)
            state.adminUsersCount += 1
        })

        builder.addCase(adminUpdateUser.fulfilled, (state, action) => {
            const index = state.adminUsers.findIndex(u => u.id === action.payload.id)
            if (index !== -1) {
                state.adminUsers[index] = action.payload
            }
        })

        builder.addCase(adminDeleteUser.fulfilled, (state, action) => {
            state.adminUsers = state.adminUsers.filter(u => u.id !== action.payload)
            state.adminUsersCount -= 1
        })
    }
})

export default userSlice.reducer
