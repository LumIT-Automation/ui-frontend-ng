import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const vmwareSlice = createSlice({
    name: 'vmware',
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


        datacentersError: (state, action) => {
          state.datacentersError = action.payload
        },
        clustersError: (state, action) => {
          state.clustersError = action.payload
        },
        clusterError: (state, action) => {
          state.clusterError = action.payload
        },
        foldersError: (state, action) => {
          state.foldersError = action.payload
        },
        templatesError: (state, action) => {
          state.templatesError = action.payload
        },
        templateError: (state, action) => {
          state.templateError = action.payload
        },
        customSpecsError: (state, action) => {
          state.customSpecsError = action.payload
        },
        customSpecError: (state, action) => {
          state.customSpecError = action.payload
        },
        bootstrapkeysError: (state, action) => {
          state.bootstrapkeysError = action.payload
        },
        finalpubkeysError: (state, action) => {
          state.finalpubkeysError = action.payload
        },
        vmCreateError: (state, action) => {
          state.vmCreateError = action.payload
        },

        historysLoading: ( state, action) => {
          state.historysLoading = action.payload
        },
        historys: ( state, action) => {
          state.historys = action.payload
        },
        historysFetch: ( state, action) => {
          state.historysFetch = action.payload
        },
        historysError: ( state, action) => {
          state.historysError = action.payload
        },


        genericError: ( state, action) => {
          state.genericError = action.payload
        },

        resetObjects: (state, action) => {
          state.asset = null
        },

        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = vmwareSlice;

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

  datacentersError,
  clustersError,
  clusterError,
  foldersError,
  templatesError,
  templateError,
  customSpecsError,
  customSpecError,
  bootstrapkeysError,
  finalpubkeysError,
  vmCreateError,

  historysLoading,
  historys,
  historysFetch,
  historysError,

  genericError,

  resetObjects,
  cleanUp
} = actions

export default reducer
