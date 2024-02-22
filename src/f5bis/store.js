import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const f5bisSlice = createSlice({
    name: 'f5bis',
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

        partitionsLoading: (state, action) => {
          state.partitionsLoading = action.payload
        },
        partitions: (state, action) => {
          state.partitions = action.payload.data.items
        },
        partitionsFetch: (state, action) => {
          state.partitionsFetch = action.payload
        },

        partition: (state, action) => {
          state.partition = action.payload
        },

        f5objectsLoading: (state, action) => {
          state.f5objectsLoading = action.payload
        },
        f5objects: (state, action) => {
          state.f5objects = action.payload.data.items
        },
        f5objectsFetch: (state, action) => {
          state.f5objectsFetch = action.payload
        },

        err: (state, action) => {
          state.err = action.payload
        },
       
    }
})

const { actions, reducer } = f5bisSlice;

export const {
  environment,

  assetsLoading,
  assets,
  assetsFetch,

  asset,

  partitionsLoading,
  partitions,
  partitionsFetch,

  partition,

  err,

} = actions

export default reducer
