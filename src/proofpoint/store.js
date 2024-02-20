import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const proofpointSlice = createSlice({
    name: 'proofpoint',
    initialState: {},
    reducers: {
        environment: (state, action) => {
          state.environment = action.payload
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

    }
})

const { actions, reducer } = proofpointSlice;

export const {
  environment,

  assets,
  asset,
  assetToken,
  
} = actions

export default reducer
