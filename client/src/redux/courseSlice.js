import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'

// ── Async thunks ─────────────────────────────────────────────────────────────

export const fetchAllCourses = createAsyncThunk(
    'courses/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('/api/courses', { params })
            return data.courses
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses')
        }
    }
)

export const fetchCourseById = createAsyncThunk(
    'courses/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(`/api/courses/${id}`)
            return data.course
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch course')
        }
    }
)

export const fetchAdminCourses = createAsyncThunk(
    'courses/fetchAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('/api/courses/admin/all')
            return data.courses
        } catch (err) {
            return rejectWithValue(err.response?.data?.message)
        }
    }
)

export const createCourse = createAsyncThunk(
    'courses/create',
    async (formData, { rejectWithValue }) => {
        try {
            // Do NOT set Content-Type manually — Axios auto-sets it with the boundary
            const { data } = await axiosInstance.post('/api/courses', formData)
            return data.course
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create course')
        }
    }
)

export const updateCourse = createAsyncThunk(
    'courses/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            // Do NOT set Content-Type manually — Axios auto-sets multipart/form-data
            // with the correct boundary when it detects a FormData object.
            const { data } = await axiosInstance.put(`/api/courses/${id}`, formData)
            return data.course
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update course')
        }
    }
)

export const deleteCourse = createAsyncThunk(
    'courses/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/courses/${id}`)
            return id
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete course')
        }
    }
)

export const enrollInCourse = createAsyncThunk(
    'courses/enroll',
    async (courseId, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post(`/api/courses/${courseId}/enroll`)
            return { courseId, course: data.course }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to enroll')
        }
    }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const courseSlice = createSlice({
    name: 'courses',
    initialState: {
        courses: [],
        currentCourse: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentCourse: (state) => { state.currentCourse = null },
        clearError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null }
        const rejected = (state, action) => { state.loading = false; state.error = action.payload }

        builder
            .addCase(fetchAllCourses.pending, pending)
            .addCase(fetchAllCourses.fulfilled, (state, action) => {
                state.loading = false; state.courses = action.payload
            })
            .addCase(fetchAllCourses.rejected, rejected)

            .addCase(fetchAdminCourses.pending, pending)
            .addCase(fetchAdminCourses.fulfilled, (state, action) => {
                state.loading = false; state.courses = action.payload
            })
            .addCase(fetchAdminCourses.rejected, rejected)

            .addCase(fetchCourseById.pending, pending)
            .addCase(fetchCourseById.fulfilled, (state, action) => {
                state.loading = false; state.currentCourse = action.payload
            })
            .addCase(fetchCourseById.rejected, rejected)

            .addCase(createCourse.pending, pending)
            .addCase(createCourse.fulfilled, (state, action) => {
                state.loading = false
                state.courses.unshift(action.payload)
            })
            .addCase(createCourse.rejected, rejected)

            .addCase(updateCourse.pending, pending)
            .addCase(updateCourse.fulfilled, (state, action) => {
                state.loading = false
                const idx = state.courses.findIndex(c => c._id === action.payload._id)
                if (idx !== -1) state.courses[idx] = action.payload
                if (state.currentCourse?._id === action.payload._id) state.currentCourse = action.payload
            })
            .addCase(updateCourse.rejected, rejected)

            .addCase(deleteCourse.pending, pending)
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.loading = false
                state.courses = state.courses.filter(c => c._id !== action.payload)
            })
            .addCase(deleteCourse.rejected, rejected)

            .addCase(enrollInCourse.fulfilled, (state, action) => {
                if (state.currentCourse?._id === action.payload.courseId) {
                    state.currentCourse = action.payload.course
                }
            })
    },
})

export const { clearCurrentCourse, clearError } = courseSlice.actions
export default courseSlice.reducer
