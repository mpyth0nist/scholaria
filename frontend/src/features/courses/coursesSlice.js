import {createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ACCESS_TOKEN } from '../../constants'
import api from '../../api'


const token = localStorage.getItem(ACCESS_TOKEN)


export const fetchCourses = createAsyncThunk("fetchCourses", async () => {
    const res = await api.get('api/courses/list/', {
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        }
    })

    return res.data
})

export const fetchSelectedCourse = createAsyncThunk("fetchSelectedCourse", async (id) => {
    const res = await api.get(`api/courses/${id}`, {
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        }
    })

    return res.data
})

export const deleteCourse = createAsyncThunk("deleteCourse", async (id) => {
    const res = await api.delete(`api/courses/${id}/delete/`, {
        headers : {
            "Authorization": `Bearer ${token}`
        }
    })

    return res.status


})

export const updateCourse = createAsyncThunk("updateCourse", async (updatedCourse) => {

    const formData = new FormData()

    for(let key in updatedCourse){

        if(Array.isArray(updatedCourse[key])){
            updatedCourse[key].forEach(id => formData.append(key, id))
        } else{
            formData.append(key, updatedCourse[key])

        }
    }
    const res = await api.patch(`api/courses/update/${updatedCourse.id}/`, 
        formData, 
        
        {
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        }

    )

    return res.status
})



const coursesSlice = createSlice({
    name: "courses",
    initialState: {courses: [], selectedCourse : {}, error: false, loading: false},

    reducer:{},

    extraReducers : (builder) => {
        builder.addCase(fetchCourses.fulfilled, (state, action) => {
            state.courses = action.payload
            state.loading = false
            console.log('courses fetch success')
        })

        builder.addCase(fetchCourses.pending, (state)=> {
            state.loading = true
            console.log('loading')
        })

        builder.addCase(fetchCourses.rejected, (state) => {
            state.error = true
            state.loading = false
        })

        builder.addCase(fetchSelectedCourse.fulfilled, (state, action) => {
            state.selectedCourse = action.payload
        })

        builder.addCase(fetchSelectedCourse.pending, (state, action) => {
            console.log("loading")
        })

        builder.addCase(deleteCourse.fulfilled, (state, action) => {
            console.log(action.payload)
        })

        builder.addCase(updateCourse.fulfilled, (state, action) => {
            console.log("course Updated successfully!")
            state.selectedCourse = action.payload
        })
        
        builder.addCase(updateCourse.pending, () => {
            console.log('course updating....')
        })

        builder.addCase(updateCourse.rejected, (state, action)=>{
            console.log('Couldnt update course')

        })
    }




})

export default coursesSlice.reducer;