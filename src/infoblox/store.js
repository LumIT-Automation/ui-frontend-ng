import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const infobloxSlice = createSlice({
    name: 'infoblox',
    initialState: {},
    reducers: {
      environment: (state, action) => {
        state.environment = action.payload
      },

      assetsLoading: (state, action) => {
        state.assetsLoading = action.payload
      },
      assets: (state, action) => {
        state.assets = action.payload.data.items
      },
      assetsFetch: (state, action) => {
        state.assetsFetch = action.payload
      },

      asset: (state, action) => {
        state.asset = action.payload
      },

      tree: (state, action) => {
        state.tree = action.payload
      },
      treeFetch: (state, action) => {
        state.treeFetch = action.payload
      },


      err: (state, action) => {
        state.err = action.payload
      },

      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = infobloxSlice;

export const {
  environment,

  assetsLoading,
  assets,
  assetsFetch,

  asset,

  tree,
  treeFetch,

  cleanUp,
  err
} = actions

export default reducer
