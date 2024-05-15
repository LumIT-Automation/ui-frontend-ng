import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const f5Slice = createSlice({
    name: 'f5',
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

        pools: (state, action) => {
          state.pools = action.payload
        },

        poolMembersFetch: (state, action) => {
          state.poolMembersFetch = action.payload
        },


        certificates: (state, action) => {
          state.certificates = action.payload
        },
        certificatesFetch: (state, action) => {
          state.certificatesFetch = action.payload
        },
        keys: (state, action) => {
          state.keys = action.payload
        },
        keysFetch: (state, action) => {
          state.keysFetch = action.payload
        },

        

        f5objects: (state, action) => {
          state.f5objects = action.payload.data.items
        },

        err: (state, action) => {
          state.err = action.payload
        },
       
    }
})

const { actions, reducer } = f5Slice;

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

  pools,
  poolMembersFetch,

  certificates,
  certificatesFetch,
  keys,
  keysFetch,

  f5objects,

  err,

} = actions

export default reducer
