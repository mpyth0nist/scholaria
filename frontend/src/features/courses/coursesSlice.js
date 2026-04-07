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

    console.log("courses are ", res.data)

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


export const createCourse = createAsyncThunk("createCourse", async (courseData) => {

    const formData = new FormData()
    for(let key in courseData){

        console.log(key)

        if(Array.isArray(courseData[key])){
            courseData[key].forEach(id => formData.append("student", id))
        
        } else if(key === "thumbnail") {
            if (courseData[key] instanceof File){
                formData.append(key, courseData[key])
            }
        }
  
        else {

            formData.append(key, courseData[key])
        }
    }
    const res = await api.post('api/courses/create-course/', formData, {
        headers : {
            "Authorization" : `Bearer ${token}`,
        }
    })

    return res.status
})


export const deleteCourse = createAsyncThunk("deleteCourse", async (id) => {
    const res = await api.delete(`api/courses/delete/${id}/`, {
        headers : {
            "Authorization": `Bearer ${token}`
        }
    })

    return res.status


})

export const updateCourse = createAsyncThunk("updateCourse", async (updatedCourse) => {
    const formData = new FormData()

    for(let key in updatedCourse){
        console.log(key)
        if(Array.isArray(updatedCourse[key])){

            updatedCourse[key].forEach(id => formData.append(key, id))
       
       
        } else if (key === "thumbnail"){

            if(updatedCourse[key] instanceof File){
                formData.append(key, updatedCourse[key])

            }


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

    return res.data
})



const coursesSlice = createSlice({
    name: "courses",
    initialState: {courses: [], selectedCourse : {}, error: false, loading: false},

    reducers: {},

    extraReducers : (builder) => {
        builder.addCase(fetchCourses.fulfilled, (state, action) => {
            state.courses = action.payload
            state.loading = false
        })

        builder.addCase(fetchCourses.pending, (state)=> {
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
        })

        builder.addCase(updateCourse.fulfilled, (state, action) => {
            state.selectedCourse = action.payload
        })
        
        builder.addCase(updateCourse.pending, () => {
            console.log('course updating....')
        })

        builder.addCase(updateCourse.rejected, (state, action)=>{
            console.log('Couldnt update course')

        })

        builder.addCase(createCourse.fulfilled, (state,action) => {
            console.log(action.payload)
        })

        builder.addCase(createCourse.pending, () => {
            console.log("Creating course ...")
        })

        builder.addCase(createCourse.rejected, (state, action) => {
            console.log(action.payload)
        })
    }




})

export default coursesSlice.reducer;