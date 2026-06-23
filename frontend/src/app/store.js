import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/users/userSlice'
import coursesReducer from '../features/courses/coursesSlice'
import quizReducer from '../features/quizzes/quizSlice'
import assignmentReducer from '../features/assignments/assignmentSlice'

export const store = configureStore({
    reducer: {
        users: userReducer,
        courses: coursesReducer,
        quizzes: quizReducer,
        assignments: assignmentReducer,
    }
})
