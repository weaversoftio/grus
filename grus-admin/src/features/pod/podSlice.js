import { createSlice } from '@reduxjs/toolkit'

export const podSlice = createSlice({
  name: 'pod',
  initialState: {},
  reducers: {},
})

// Action creators are generated for each case reducer function
export const podActions = {...podSlice.actions}

export default podSlice.reducer