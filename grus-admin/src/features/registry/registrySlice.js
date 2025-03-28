import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registryApi } from '../../api/registryApi';

const getList = createAsyncThunk(
  `registry_list`,
  async (_, thunkApi) => {
    return await registryApi.getList()
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const initialState = {
  loading: false,
  list: [],
  message: "",
  error: ""
}
export const registrySlice = createSlice({
  name: 'registry',
  initialState,
  reducers: {
    clearState: (state, action) => {
      state = initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getList.fulfilled, (state, action) => {
        const { message = "", registry_configs = [] } = action.payload || {};
        // console.log("registry getList.fulfilled", action.payload)
        state.message = message
        state.list = registry_configs
        state.loading = false
        return state
      })
      .addCase(getList.pending, (state, action) => {
        state.message = ""
        state.loading = true
        return state
      })
      .addCase(getList.rejected, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        console.log("registry getlist rejected", action.payload)
        state.message = ""
        state.error = action.payload.toString();
        return state
      })
      

  }
})

export const registryActions = { ...registrySlice.actions, getList }

export default registrySlice.reducer