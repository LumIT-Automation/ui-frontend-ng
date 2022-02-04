import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const fortinetdbSlice = createSlice({
    name: 'fortinetdb',
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


      projectsLoading: (state, action) => {
        state.projectsLoading = action.payload
      },
      projects: (state, action) => {
        state.projects = action.payload.data.items
      },
      projectsFetch: (state, action) => {
        state.projectsFetch = action.payload
      },
      projectsError: (state, action) => {
        state.projectsError = action.payload
      },

      devicesLoading: (state, action) => {
        state.devicesLoading = action.payload
      },
      devices: (state, action) => {
        state.devices = action.payload.data.items
      },
      devicesFetch: (state, action) => {
        state.devicesFetch = action.payload
      },
      devicesError: (state, action) => {
        state.devicesError = action.payload
      },

      ddossesLoading: (state, action) => {
        state.ddossesLoading = action.payload
      },
      ddosses: (state, action) => {
        state.ddosses = action.payload.data.items
      },
      ddossesFetch: (state, action) => {
        state.ddossesFetch = action.payload
      },
      ddossesError: (state, action) => {
        state.ddossesError = action.payload
      },


      project: (state, action) => {
        state.project = action.payload
      },
      projectError: (state, action) => {
        state.projectError = action.payload
      },

      device: (state, action) => {
        state.device = action.payload
      },
      deviceError: (state, action) => {
        state.deviceError = action.payload
      },

      ddos: (state, action) => {
        state.ddos = action.payload
      },
      ddosError: (state, action) => {
        state.ddosError = action.payload
      },


      firmwaresLoading: (state, action) => {
        state.firmwaresLoading = action.payload
      },
      firmwares: (state, action) => {
        state.firmwares = action.payload.data.items
      },
      firmwaresFetch: (state, action) => {
        state.firmwaresFetch = action.payload
      },
      firmwaresError: (state, action) => {
        state.firmwaresError = action.payload
      },

      firmwareLoading: (state, action) => {
        state.firmwareLoading = action.payload
      },
      firmware: (state, action) => {
        state.firmware = action.payload.data.items
      },
      firmwareFetch: (state, action) => {
        state.firmwareFetch = action.payload
      },
      firmwareError: (state, action) => {
        state.firmwareError = action.payload
      },

      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = fortinetdbSlice;

export const {
  permissionsLoading,
  permissions,
  permissionsFetch,
  permissionsError,

  identityGroupsLoading,
  identityGroups,
  identityGroupsFetch,
  identityGroupsError,

  projectsLoading,
  projects,
  projectsFetch,
  projectsError,

  devicesLoading,
  devices,
  devicesFetch,
  devicesError,

  ddossesLoading,
  ddosses,
  ddossesFetch,
  ddossesError,


  project,
  projectError,

  device,
  deviceError,

  ddos,
  ddosError,


  firmwaresLoading,
  firmwares,
  firmwaresFetch,
  firmwaresError,

  firmwareLoading,
  firmware,
  firmwareFetch,
  firmwareError,

  cleanUp
} = actions

export default reducer
