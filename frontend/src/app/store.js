import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from '../features/users/userSlice'
import coursesReducer from '../features/courses/coursesSlice'
import quizReducer from '../features/quizzes/quizSlice'
import assignmentReducer from '../features/assignments/assignmentSlice'

const appReducer = combineReducers({
    users: userReducer,
    courses: coursesReducer,
    quizzes: quizReducer,
    assignments: assignmentReducer,
})

const rootReducer = (state, action) => {
    // Clear all state on any logout action
    if (action.type === 'user/logout' || action.type === 'logoutUser/fulfilled' || action.type === 'logoutUser/rejected') {
        state = undefined;
    }
    return appReducer(state, action);
}

export const store = configureStore({
    reducer: rootReducer
})
