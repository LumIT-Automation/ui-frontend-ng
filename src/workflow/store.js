import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const workflowSlice = createSlice({
    name: 'workflow',
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

      workflowsLoading: (state, action) => {
        state.workflowsLoading = action.payload
      },
      workflows: (state, action) => {
        state.workflows = action.payload.data.items
      },
      workflowsFetch: (state, action) => {
        state.workflowsFetch = action.payload
      },
      workflowsError: (state, action) => {
        state.workflowsError = action.payload
      },

      workflow: (state, action) => {
        state.workflow = action.payload
      },
      workflowAddError: (state, action) => {
        state.workflowAddError = action.payload
      },
      workflowModifyError: (state, action) => {
        state.workflowModifyError = action.payload
      },
      workflowDeleteError: (state, action) => {
        state.workflowDeleteError = action.payload
      },

      hostRemoveError: (state, action) => {
        state.hostRemoveError = action.payload
      },
      hostAddError: (state, action) => {
        state.hostAddError = action.payload
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

const { actions, reducer } = workflowSlice;

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

  workflowsLoading,
  workflows,
  workflowsFetch,
  workflowsError,

  workflow,
  workflowAddError,
  workflowModifyError,
  workflowDeleteError,

  hostRemoveError,
  hostAddError,

  historysLoading,
  historys,
  historysFetch,
  historysError,

  genericError,

  cleanUp
} = actions

export default reducer
