import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { secretApi } from '../../api/secretApi';

const getList = createAsyncThunk('secrets_list', async () => {
  const response = await secretApi.getList()
  return response
})

const initialState = {
  list: [],
  loading: false,
  error: null
}
export const secretsSlice = createSlice({
  name: 'secrets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getList.pending, (state, action) => {
        state.loading = true
      })
      .addCase(getList.fulfilled, (state, action) => {
        const { message = "", success = false, secrets = [] } = action.payload || {}
        state.loading = false
        state.list = secrets
      })
      .addCase(getList.rejected, (state, action) => {
        const { message = "", success = false, secrets = [] } = action.payload || {}
        state.loading = false
      })
  }
})

export const secretsActions = { ...secretsSlice.actions, getList }

export default secretsSlice.reducer