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



      setDevicesLoading: (state, action) => {
        state.devicesLoading = action.payload
      },
      setDevices: (state, action) => {
        state.devices = action.payload.data.items
      },
      setDevicesFetch: (state, action) => {
        state.devicesFetch = action.payload
      },
      setDevicesError: (state, action) => {
        state.devicesError = action.payload
      },

      setDdossesLoading: (state, action) => {
        state.ddossesLoading = action.payload
      },
      setDdosses: (state, action) => {
        state.ddosses = action.payload.data.items
      },
      setDdossesFetch: (state, action) => {
        state.ddossesFetch = action.payload
      },
      setDdossesError: (state, action) => {
        state.ddossesError = action.payload
      },

      setProjectsLoading: (state, action) => {
        state.projectsLoading = action.payload
      },
      setProjects: (state, action) => {
        state.projects = action.payload.data.items
      },
      setProjectsFetch: (state, action) => {
        state.projectsFetch = action.payload
      },
      setProjectsError: (state, action) => {
        state.projectsError = action.payload
      },


      setDevice: (state, action) => {
        state.device = action.payload
      },
      setDeviceAddError: (state, action) => {
        state.deviceAddError = action.payload
      },
      setDeviceModifyError: (state, action) => {
        state.deviceModifyError = action.payload
      },
      setDeviceDeleteError: (state, action) => {
        state.deviceDeleteError = action.payload
      },

      setDdos: (state, action) => {
        state.ddos = action.payload
      },
      setDdosAddError: (state, action) => {
        state.ddosAddError = action.payload
      },
      setDdosModifyError: (state, action) => {
        state.ddosModifyError = action.payload
      },
      setDdosDeleteError: (state, action) => {
        state.ddosDeleteError = action.payload
      },

      setProject: (state, action) => {
        state.project = action.payload
      },
      setProjectAddError: (state, action) => {
        state.projectAddError = action.payload
      },
      setProjectModifyError: (state, action) => {
        state.projectModifyError = action.payload
      },
      setProjectDeleteError: (state, action) => {
        state.projectDeleteError = action.payload
      },



      setFirmwaresLoading: (state, action) => {
        state.firmwaresLoading = action.payload
      },
      setFirmwares: (state, action) => {
        state.firmwares = action.payload.data.items
      },
      setFirmwaresFetch: (state, action) => {
        state.firmwaresFetch = action.payload
      },
      setFirmwaresError: (state, action) => {
        state.firmwaresError = action.payload
      },

      setFirmwareLoading: (state, action) => {
        state.firmwareLoading = action.payload
      },
      setFirmware: (state, action) => {
        state.firmware = action.payload.data.items
      },
      setFirmwareFetch: (state, action) => {
        state.firmwareFetch = action.payload
      },
      setFirmwareError: (state, action) => {
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

  setDevicesLoading,
  setDevices,
  setDevicesFetch,
  setDevicesError,

  setDdossesLoading,
  setDdosses,
  setDdossesFetch,
  setDdossesError,

  setProjectsLoading,
  setProjects,
  setProjectsFetch,
  setProjectsError,

  setDevice,
  setDeviceAddError,
  setDeviceModifyError,
  setDeviceDeleteError,

  setDdos,
  setDdosAddError,
  setDdosModifyError,
  setDdosDeleteError,

  setProject,
  setProjectAddError,
  setProjectModifyError,
  setProjectDeleteError,



  setFirmwaresLoading,
  setFirmwares,
  setFirmwaresFetch,
  setFirmwaresError,

  setFirmwareLoading,
  setFirmware,
  setFirmwareFetch,
  setFirmwareError,

  cleanUp
} = actions

export default reducer
