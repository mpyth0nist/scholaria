import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api'

import { ACCESS_TOKEN } from "../../constants";

const token = localStorage.getItem(ACCESS_TOKEN)
const initialState = {
    isAuthenticated : false,
    user: {}
}

export const fetchUser = createAsyncThunk('fetchUser', async () => {
    const res = await api.get('api/users/user/', {
        headers:{
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        }
    })

    return res.data


})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers : {},

    extraReducers : (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.isAuthenticated = true
            state.user = action.payload
            console.log(action.payload)
            console.log('success')
        })

        builder.addCase(fetchUser.pending, (state) => {
            console.log('loading')
        })

        builder.addCase(fetchUser.rejected, (state)=> {
            console.log('Something wrong happened')
        })
    }
})

export default userSlice.reducer

