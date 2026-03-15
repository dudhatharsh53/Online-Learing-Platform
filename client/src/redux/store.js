import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import courseReducer from './courseSlice'
import facultyReducer from './facultySlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer,
        faculty: facultyReducer,
    },
    devTools: import.meta.env.DEV,
})

export default store
