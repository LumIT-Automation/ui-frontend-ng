import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*
create Slice creates a small piece of the store, in this case the slice for the balancers.
It has a name, an initial state, and several methods that set the state,
  setAssetList
  selectAsset
  setPartitions
  selectPartition
  setPoolList
  cleanUp
Methods (called actions) must be exported.
*/


const infobloxSlice = createSlice({
    name: 'infoblox',
    initialState: {},
    reducers: {


        setInfobloxEnvironment: (state, action) => {
          state.infobloxEnvironment = action.payload
        },

        setInfobloxAssetsLoading: (state, action) => {
          state.infobloxAssetsLoading = action.payload
        },
        setInfobloxAssets: (state, action) => {
          state.infobloxAssets = action.payload.data.items
        },
        setInfobloxAssetsFetchStatus: (state, action) => {
          state.infobloxAssetsFetchStatus = action.payload
        },

        setInfobloxAsset: (state, action) => {
          console.log('store')
          state.infobloxAsset = action.payload
        },

        setNetworksLoading: (state, action) => {
          state.infobloxAssetsLoading = action.payload
        },
        setNetworks: (state, action) => {
          state.infobloxAssets = action.payload.data.items
        },
        setNetworksFetchStatus: (state, action) => {
          state.infobloxAssetsFetchStatus = action.payload
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

  setInfobloxEnvironment,

  setInfobloxAssetsLoading,
  setInfobloxAssets,
  setInfobloxAssetsFetchStatus,

  setInfobloxAsset,

  setNetworksLoading,
  setNetworks,
  setNetworksFetchStatus,

  selectAsset,

  cleanUp
} = actions

export default reducer
