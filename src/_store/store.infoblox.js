import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const infobloxSlice = createSlice({
    name: 'infoblox',
    initialState: {},
    reducers: {

      permissionsLoading: (state, action) => {
        state.permissionsLoading = action.payload
      },
      permissions: (state, action) => {
        state.permissions = action.payload
      },
      permissionsFetch: (state, action) => {
        state.permissionsFetch = action.payload
      },
      permissionsError: (state, action) => {
        state.permissionsError = action.payload
      },

      identityGroupsLoading: (state, action) => {
        state.identityGroupsLoading = action.payload
      },
      identityGroups: (state, action) => {
        state.identityGroups = action.payload.data.items
      },
      identityGroupsFetch: (state, action) => {
        state.identityGroupsFetch = action.payload
      },
      identityGroupsError: (state, action) => {
        state.identityGroupsError = action.payload
      },

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
      addAssetError: (state, action) => {
        state.addAssetError = action.payload
      },
      modifyAssetError: (state, action) => {
        state.modifyAssetError = action.payload
      },
      deleteAssetError: (state, action) => {
        state.deleteAssetError = action.payload
      },

      treeLoading: (state, action) => {
        state.treeLoading = action.payload
      },
      tree: (state, action) => {
        state.tree = [action.payload.data['/']]
      },
      treeFetch: (state, action) => {
        state.treeFetch = action.payload
      },
      treeError: (state, action) => {
        state.treeError = action.payload
      },

      networksLoading: (state, action) => {
        state.networksLoading = action.payload
      },
      networks: (state, action) => {
        state.networks = action.payload.data
      },
      networksFetch: (state, action) => {
        state.networksFetch = action.payload
      },
      networksError: (state, action) => {
        state.networksError = action.payload
      },

      containersLoading: (state, action) => {
        state.containersLoading = action.payload
      },
      containers: (state, action) => {
        state.containers = action.payload.data
      },
      containersFetch: (state, action) => {
        state.containersFetch = action.payload
      },
      containersError: (state, action) => {
        state.containersError = action.payload
      },

      realNetworksLoading: (state, action) => {
        state.realNetworksLoading = action.payload
      },
      realNetworks: (state, action) => {
        state.realNetworks = action.payload
      },
      realNetworksFetch: (state, action) => {
        state.RealNetworksFetch = action.payload
      },
      realNetworksError: (state, action) => {
        state.RealNetworksError = action.payload
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


      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = infobloxSlice;

export const {
  permissionsLoading,
  permissions,
  permissionsFetch,
  permissionsError,

  identityGroupsLoading,
  identityGroups,
  identityGroupsFetch,
  identityGroupsError,

  environment,
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,
  addAssetError,
  modifyAssetError,
  deleteAssetError,

  treeLoading,
  tree,
  treeFetch,
  treeError,

  networksLoading,
  networks,
  networksFetch,
  networksError,

  containersLoading,
  containers,
  containersFetch,
  containersError,

  realNetworksLoading,
  realNetworks,
  realNetworksFetch,
  realNetworksError,

  ipDetailError,
  networkError,
  containerError,
  nextAvailableIpError,
  ipModifyError,
  ipReleaseError,

  cleanUp
} = actions

export default reducer
