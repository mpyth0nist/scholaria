import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/users/userSlice'
import coursesReducer from '../features/courses/coursesSlice'
export const store = configureStore({
    reducer : {
        users: userReducer,
        courses: coursesReducer,
    }
})

