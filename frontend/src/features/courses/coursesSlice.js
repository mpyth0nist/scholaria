import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ACCESS_TOKEN } from '../../constants'
import api from '../../api'


// Removed module-level token logic.
// All requests now rely on api.js interceptor for Authorization headers.


export const fetchCourses = createAsyncThunk("fetchCourses", async () => {
    const res = await api.get('api/courses/list/')


    return res.data
})

export const fetchClasses = createAsyncThunk("fetchClasses", async () => {
    const res = await api.get('api/courses/classes/list/')
    return res.data
})

export const fetchSelectedCourse = createAsyncThunk("fetchSelectedCourse", async (id) => {
    const res = await api.get(`api/courses/${id}/`)

    return res.data
})


export const createCourse = createAsyncThunk("createCourse", async (courseData, { rejectWithValue }) => {
    const formData = new FormData()
    for (let key in courseData) {
        if (Array.isArray(courseData[key])) {
            courseData[key].forEach(id => formData.append(key, id))
        } else if (key === "thumbnail") {
            if (courseData[key] instanceof File) {
                formData.append(key, courseData[key])
            }
        } else {
            formData.append(key, courseData[key])
        }
    }
    try {
        const res = await api.post('api/courses/create-course/', formData)
        return res.data   // ← returns the full course object including id
    } catch (err) {
        return rejectWithValue(err.response?.data)
    }
})


export const deleteCourse = createAsyncThunk("deleteCourse", async (id) => {
    await api.delete(`api/courses/delete/${id}/`)
    return id
})

export const updateCourse = createAsyncThunk("updateCourse", async (updatedCourse) => {
    const formData = new FormData()

    for (let key in updatedCourse) {
        console.log(key)
        if (Array.isArray(updatedCourse[key])) {

            updatedCourse[key].forEach(id => formData.append(key, id))


        } else if (key === "thumbnail") {

            if (updatedCourse[key] instanceof File) {
                formData.append(key, updatedCourse[key])

            }


        } else {
            formData.append(key, updatedCourse[key])

        }
    }
    const res = await api.patch(`api/courses/update/${updatedCourse.id}/`, formData)

    return res.data
})



const coursesSlice = createSlice({
    name: "courses",
    initialState: { courses: [], selectedCourse: {}, classes: [], error: false, loading: false },

    reducers: {},

    extraReducers: (builder) => {
        builder.addCase(fetchCourses.fulfilled, (state, action) => {
            state.courses = action.payload
            state.loading = false
        })

        builder.addCase(fetchCourses.pending, (state) => {
            state.loading = true
        })

        builder.addCase(fetchCourses.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(fetchSelectedCourse.fulfilled, (state, action) => {
            state.selectedCourse = action.payload
        })

        builder.addCase(fetchSelectedCourse.pending, (state, action) => {
        })

        builder.addCase(deleteCourse.fulfilled, (state, action) => {
            state.courses = state.courses.filter(course => course.id !== action.payload)
        })

        builder.addCase(updateCourse.fulfilled, (state, action) => {
            state.selectedCourse = action.payload
        })

        builder.addCase(updateCourse.pending, () => {
            console.log('course updating....')
        })

        builder.addCase(updateCourse.rejected, (state, action) => {
            console.log('Couldnt update course')

        })

        builder.addCase(createCourse.fulfilled, (state, action) => {
            state.courses.push(action.payload)
            state.loading = false
        })

        builder.addCase(createCourse.pending, (state) => {
            state.loading = true
        })

        builder.addCase(createCourse.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(fetchClasses.fulfilled, (state, action) => {
            state.classes = action.payload
        })
    }




})

export default coursesSlice.reducer;