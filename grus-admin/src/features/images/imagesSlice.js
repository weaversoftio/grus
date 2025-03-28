import { createSlice } from '@reduxjs/toolkit'

export const imagesSlice = createSlice({
  name: 'images',
  initialState: {},
  reducers: {},
})

// Action creators are generated for each case reducer function
export const imagesActions = {...imagesSlice.actions}

export default imagesSlice.reducer