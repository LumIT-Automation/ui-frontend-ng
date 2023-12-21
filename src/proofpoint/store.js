import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const f5Slice = createSlice({
    name: 'f5',
    initialState: {},
    reducers: {
        environment: (state, action) => {
          state.environment = action.payload
        },
        environmentError: (state, action) => {
          state.environmentError = action.payload
        },

        assets: (state, action) => {
          state.assets = action.payload.data.items
        },
        asset: (state, action) => {
          state.asset = action.payload
        },

        err: (state, action) => {
          state.err = action.payload
        },       
    }
})

const { actions, reducer } = f5Slice;

export const {
  environment,
  environmentError,

  assets,
  asset,

  err,
  
} = actions

export default reducer
