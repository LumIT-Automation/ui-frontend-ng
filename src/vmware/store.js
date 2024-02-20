import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const vmwareSlice = createSlice({
    name: 'vmware',
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


        taskProgressLoading: ( state, action) => {
          state.taskProgressLoading = action.payload
        },
        secondStageProgressLoading: ( state, action) => {
          state.secondStageProgressLoading = action.payload
        },

        resetObjects: (state, action) => {
          state.asset = null
        },

        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = vmwareSlice;

export const {
  environment,

  assetsLoading,
  assets,
  assetsFetch,

  asset,

  taskProgressLoading,
  secondStageProgressLoading,

  resetObjects,
  cleanUp
} = actions

export default reducer
