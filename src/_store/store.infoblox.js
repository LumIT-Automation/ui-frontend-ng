import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

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
          state.infobloxAsset = action.payload
        },

        setNetworksLoading: (state, action) => {
          state.networksLoading = action.payload
        },
        setNetworks: (state, action) => {
          state.networks = action.payload.data
        },
        setNetworksFetchStatus: (state, action) => {
          state.networksFetchStatus = action.payload
        },

        setContainersLoading: (state, action) => {
          state.containersLoading = action.payload
        },
        setContainers: (state, action) => {
          state.containers = action.payload.data
        },
        ssetContainersFetchStatus: (state, action) => {
          state.containersFetchStatus = action.payload
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

  setContainersLoading,
  setContainers,
  setContainersFetchStatus,

  cleanUp
} = actions

export default reducer
