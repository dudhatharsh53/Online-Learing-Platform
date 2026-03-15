import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'

// ── Async thunks ────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
    'auth/register',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('/api/auth/register', formData)
            return data.user
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed')
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('/api/auth/login', formData)
            return data.user
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Login failed')
        }
    }
)

export const fetchCurrentUser = createAsyncThunk(
    'auth/me',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('/api/auth/me')
            return data.user
        } catch (err) {
            return rejectWithValue(null)
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/api/auth/logout')
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Logout failed')
        }
    }
)

// ── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: false, // Has the app tried to fetch current user yet?
        error: null,
    },
    reducers: {
        clearError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // Login
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // Fetch current user (on app load)
        builder
            .addCase(fetchCurrentUser.pending, (state) => { state.loading = true })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false
                state.initialized = true
                if (action.payload) {
                    // Server returned a valid user
                    state.user = action.payload
                    state.isAuthenticated = true
                } else {
                    // Server returned null (no cookie / expired token)
                    state.user = null
                    state.isAuthenticated = false
                }
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false
                state.user = null
                state.isAuthenticated = false
                state.initialized = true
            })

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
            })
    },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
