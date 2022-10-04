import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const checkpointSlice = createSlice({
    name: 'checkpoint',
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


      permissionAddError: ( state, action) => {
        state.permissionAddError = action.payload
      },
      permissionModifyError: ( state, action) => {
        state.permissionModifyError = action.payload
      },
      permissionDeleteError: ( state, action) => {
        state.permissionDeleteError = action.payload
      },

      rolesError: ( state, action) => {
        state.rolesError = action.payload
      },
      newIdentityGroupAddError: ( state, action) => {
        state.newIdentityGroupAddError = action.payload
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
      assetAddError: (state, action) => {
        state.assetAddError = action.payload
      },
      assetModifyError: (state, action) => {
        state.assetModifyError = action.payload
      },
      assetDeleteError: (state, action) => {
        state.assetDeleteError = action.payload
      },

      domainsLoading: (state, action) => {
        state.domainsLoading = action.payload
      },
      domains: (state, action) => {
        state.domains = action.payload.data.items
      },
      domainsFetch: (state, action) => {
        state.domainsFetch = action.payload
      },
      domainsError: (state, action) => {
        state.domainsError = action.payload
      },

      domain: (state, action) => {
        state.domain = action.payload
      },

      hostsLoading: (state, action) => {
        state.hostsLoading = action.payload
      },
      hosts: (state, action) => {
        state.hosts = action.payload.data.items
      },
      hostsFetch: (state, action) => {
        state.hostsFetch = action.payload
      },
      hostsError: (state, action) => {
        state.hostsError = action.payload
      },

      hostAddError: (state, action) => {
        state.hostAddError = action.payload
      },
      hostDeleteError: (state, action) => {
        state.hostDeleteError = action.payload
      },



      groupsLoading: (state, action) => {
        state.groupsLoading = action.payload
      },
      groups: (state, action) => {
        state.groups = action.payload.data.items
      },
      groupsFetch: (state, action) => {
        state.groupsFetch = action.payload
      },
      groupsError: (state, action) => {
        state.groupsError = action.payload
      },

      groupAddError: (state, action) => {
        state.groupAddError = action.payload
      },
      groupDeleteError: (state, action) => {
        state.groupDeleteError = action.payload
      },

      networksLoading: (state, action) => {
        state.networksLoading = action.payload
      },
      networks: (state, action) => {
        state.networks = action.payload.data.items
      },
      networksFetch: (state, action) => {
        state.networksFetch = action.payload
      },
      networksError: (state, action) => {
        state.networksError = action.payload
      },

      networkAddError: (state, action) => {
        state.networkAddError = action.payload
      },
      networkDeleteError: (state, action) => {
        state.networkDeleteError = action.payload
      },

      hostRemoveError: (state, action) => {
        state.hostRemoveError = action.payload
      },

      historysLoading: ( state, action) => {
        state.historysLoading = action.payload
      },
      historys: ( state, action) => {
        state.historys = action.payload.data.items
      },
      historysFetch: ( state, action) => {
        state.historysFetch = action.payload
      },
      historysError: ( state, action) => {
        state.historysError = action.payload
      },

      genericError: (state, action) => {
        state.genericError = action.payload
      },


      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = checkpointSlice;

export const {
  permissionsLoading,
  permissions,
  permissionsFetch,
  permissionsError,

  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  rolesError,
  newIdentityGroupAddError,

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
  assetAddError,
  assetModifyError,
  assetDeleteError,

  domainsLoading,
  domains,
  domainsFetch,
  domainsError,

  domain,

  hostsLoading,
  hosts,
  hostsFetch,
  hostsError,
  hostAddError,
  hostDeleteError,

  groupsLoading,
  groups,
  groupsFetch,
  groupsError,
  groupAddError,
  groupDeleteError,

  networksLoading,
  networks,
  networksFetch,
  networksError,
  networkAddError,
  networkDeleteError,

  hostRemoveError,

  historysLoading,
  historys,
  historysFetch,
  historysError,

  genericError,

  cleanUp
} = actions

export default reducer
