import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const proofpointSlice = createSlice({
    name: 'proofpoint',
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

        assetToken: (state, action) => {
          console.log(action)
          state.assetToken = action.payload
        },

        err: (state, action) => {
          state.err = action.payload
        },       
    }
})

const { actions, reducer } = proofpointSlice;

export const {
  environment,
  environmentError,

  assets,
  asset,
  assetToken,

  err,
  
} = actions

export default reducer
