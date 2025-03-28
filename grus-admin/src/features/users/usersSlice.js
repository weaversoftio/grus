import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { userApi } from '../../api/userApi';

const getList = createAsyncThunk('users/getList', async () => {
  const response = await userApi.getList()
  return response?.data
})

const initialState = {
  list: [],
  loading: false,
  error: null
}
export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getList.pending, (state, action) => {
        state.loading = true
      })
      .addCase(getList.fulfilled, (state, action) => {
        // console.log("getList.fulfilled", action.payload)
        state.loading = false
        state.list = action.payload || []
      })
      .addCase(getList.rejected, (state, action) => { 
        state.loading = false
        state.error = action.error
      })
  }
})

export const usersActions = { ...usersSlice.actions, getList }

export default usersSlice.reducer