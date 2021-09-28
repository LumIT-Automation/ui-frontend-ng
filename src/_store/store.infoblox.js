import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const infobloxSlice = createSlice({
    name: 'infoblox',
    initialState: {},
    reducers: {


      setEnvironment: (state, action) => {
        state.environment = action.payload
      },

      setAssetsLoading: (state, action) => {
        state.assetsLoading = action.payload
      },
      setAssets: (state, action) => {
        state.assets = action.payload.data.items
      },
      setAssetsFetch: (state, action) => {
        state.assetsFetch = action.payload
      },

      setAsset: (state, action) => {
        state.asset = action.payload
      },

      setNetworksLoading: (state, action) => {
        state.networksLoading = action.payload
      },
      setNetworks: (state, action) => {
        state.networks = action.payload.data
      },
      setNetworksFetch: (state, action) => {
        state.networksFetch = action.payload
      },

      setContainersLoading: (state, action) => {
        state.containersLoading = action.payload
      },
      setContainers: (state, action) => {
        state.containers = action.payload.data
      },
      ssetContainersFetch: (state, action) => {
        state.containersFetch = action.payload
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

  setEnvironment,

  setAssetsLoading,
  setAssets,
  setAssetsFetch,

  setAsset,

  setNetworksLoading,
  setNetworks,
  setNetworksFetch,

  setContainersLoading,
  setContainers,
  setContainersFetch,

  cleanUp
} = actions

export default reducer
