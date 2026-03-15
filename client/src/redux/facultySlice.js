import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/faculty';

// Async thunks
export const fetchFaculties = createAsyncThunk('faculty/fetchAll', async (_, thunkAPI) => {
    try {
        const response = await axios.get(API_URL);
        return response.data.faculties;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const createFaculty = createAsyncThunk('faculty/create', async (formData, thunkAPI) => {
    try {
        const response = await axios.post(API_URL, formData, {
            withCredentials: true,
        });
        return response.data.faculty;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const updateFaculty = createAsyncThunk('faculty/update', async ({ id, formData }, thunkAPI) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, formData, {
            withCredentials: true,
        });
        return response.data.faculty;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const deleteFaculty = createAsyncThunk('faculty/delete', async (id, thunkAPI) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            withCredentials: true,
        });
        return id;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const facultySlice = createSlice({
    name: 'faculty',
    initialState: {
        faculties: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchFaculties.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFaculties.fulfilled, (state, action) => {
                state.loading = false;
                state.faculties = action.payload;
            })
            .addCase(fetchFaculties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createFaculty.fulfilled, (state, action) => {
                state.faculties.unshift(action.payload);
            })
            // Update
            .addCase(updateFaculty.fulfilled, (state, action) => {
                const index = state.faculties.findIndex(f => f._id === action.payload._id);
                if (index !== -1) state.faculties[index] = action.payload;
            })
            // Delete
            .addCase(deleteFaculty.fulfilled, (state, action) => {
                state.faculties = state.faculties.filter(f => f._id !== action.payload);
            });
    },
});

export default facultySlice.reducer;
