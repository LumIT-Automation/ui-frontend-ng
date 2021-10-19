import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const infobloxSlice = createSlice({
    name: 'infoblox',
    initialState: {},
    reducers: {

      setPermissionsLoading: (state, action) => {
        state.permissionsLoading = action.payload
      },
      setPermissions: (state, action) => {
        state.permissions = action.payload
      },
      setPermissionsFetch: (state, action) => {
        state.permissionsFetch = action.payload
      },

      setIdentityGroupsLoading: (state, action) => {
        state.identityGroupsLoading = action.payload
      },
      setIdentityGroups: (state, action) => {
        state.identityGroups = action.payload.data.items
      },
      setIdentityGroupsFetch: (state, action) => {
        state.identityGroupsFetch = action.payload
      },

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

      setTreeLoading: (state, action) => {
        state.treeLoading = action.payload
      },
      setTree: (state, action) => {
        state.tree = [action.payload.data['/']]
      },
      setTreeFetch: (state, action) => {
        state.treeFetch = action.payload
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

      setRealNetworksLoading: (state, action) => {
        state.realNetworksLoading = action.payload
      },
      setRealNetworks: (state, action) => {
        console.log(action.payload)
        state.realNetworks = action.payload
      },
      setRealNetworksFetch: (state, action) => {
        state.RealNetworksFetch = action.payload
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
  setPermissionsLoading,
  setPermissions,
  setPermissionsFetch,

  setIdentityGroupsLoading,
  setIdentityGroups,
  setIdentityGroupsFetch,

  setEnvironment,

  setAssetsLoading,
  setAssets,
  setAssetsFetch,

  setAsset,

  setTreeLoading,
  setTree,
  setTreeFetch,

  setNetworksLoading,
  setNetworks,
  setNetworksFetch,

  setContainersLoading,
  setContainers,
  setContainersFetch,

  setRealNtworksLoading,
  setRealNetworks,
  setRealNetworksFetch,

  cleanUp
} = actions

export default reducer
