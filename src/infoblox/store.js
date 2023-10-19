import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const infobloxSlice = createSlice({
    name: 'infoblox',
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

      treeLoading: (state, action) => {
        state.treeLoading = action.payload
      },
      tree: (state, action) => {
        state.tree = action.payload
      },
      treeFetch: (state, action) => {
        state.treeFetch = action.payload
      },
      treeError: (state, action) => {
        state.treeError = action.payload
      },

      networksError: (state, action) => {
        state.networksError = action.payload
      },
      containersError: (state, action) => {
        state.containersError = action.payload
      },
      accountsAndProvidersError: (state, action) => {
        state.accountsAndProvidersError = action.payload
      },
      cloudNetworksError: (state, action) => {
        state.cloudNetworksError = action.payload
      },

      ipDetailError: (state, action) => {
        state.ipDetailError = action.payload
      },

      networkError: (state, action) => {
        state.networkError = action.payload
      },
      containerError: (state, action) => {
        state.containerError = action.payload
      },
      nextAvailableIpError: (state, action) => {
        state.nextAvailableIpError = action.payload
      },
      ipModifyError: (state, action) => {
        state.ipModifyError = action.payload
      },
      ipReleaseError: (state, action) => {
        state.ipReleaseError = action.payload
      },

      assignCloudNetworkError: (state, action) => {
        state.assignCloudNetworkError = action.payload
      },
      cloudNetworkDeleteError: (state, action) => {
        state.assignCloudNetworkError = action.payload
      },

      genericError: (state, action) => {
        state.genericError = action.payload
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
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,

  treeLoading,
  tree,
  treeFetch,
  treeError,

  networksError,
  containersError,

  ipDetailError,
  networkError,
  containerError,
  accountsAndProvidersError,
  cloudNetworksError,
  nextAvailableIpError,
  ipModifyError,
  ipReleaseError,

  assignCloudNetworkError,
  cloudNetworkDeleteError,

  genericError,

  cleanUp,
  err
} = actions

export default reducer
