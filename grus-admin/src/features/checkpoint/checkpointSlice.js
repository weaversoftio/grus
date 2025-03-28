import { createSlice } from '@reduxjs/toolkit'

export const checkpointSlice = createSlice({
  name: 'checkpoint',
  initialState: {},
  reducers: {},
})

// Action creators are generated for each case reducer function
export const checkpointActions = {...checkpointSlice.actions}

export default checkpointSlice.reducer