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

        assetsLoading: (state, action) => {
          state.assetsLoading = action.payload
        },
        assets: (state, action) => {
          state.assets = action.payload.data.items
        },
        assetsFetch: (state, action) => {
          state.assetsFetch = action.payload
        },
        assetsError: (state, action) => {
          state.assetsError = action.payload
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
        partitionsError: (state, action) => {
          state.partitionsError = action.payload
        },

        partition: (state, action) => {
          state.partition = action.payload
        },

        err: (state, action) => {
          state.err = action.payload
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
        f5objectsError: (state, action) => {
          state.f5objectsError = action.payload
        },

        f5objectAddError: (state, action) => {
          state.f5objectAddError = action.payload
        },
        f5objectDeleteError: (state, action) => {
          state.f5objectDeleteError = action.payload
        },
       
    }
})

const { actions, reducer } = f5Slice;

export const {
  environment,
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,

  partitionsLoading,
  partitions,
  partitionsFetch,
  partitionsError,

  partition,

  err,
  

} = actions

export default reducer
