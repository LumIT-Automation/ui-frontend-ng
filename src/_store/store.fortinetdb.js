import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const fortinetdbSlice = createSlice({
    name: 'fortinetdb',
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
      setPermissionsError: (state, action) => {
        state.permissionsError = action.payload
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
      setIdentityGroupsError: (state, action) => {
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

      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = fortinetdbSlice;

export const {
  setPermissionsLoading,
  setPermissions,
  setPermissionsFetch,
  setPermissionsError,

  setIdentityGroupsLoading,
  setIdentityGroups,
  setIdentityGroupsFetch,
  setIdentityGroupsError,

  setDevicesLoading,
  setDevices,
  setDevicesFetch,
  setDevicesError,

  setFirmwaresLoading,
  setFirmwares,
  setFirmwaresFetch,
  setFirmwaresError,

  setDevice,
  setDeviceAddError,
  setDeviceModifyError,
  setDeviceDeleteError,

  cleanUp
} = actions

export default reducer
