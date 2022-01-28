import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*

*/

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState: {},
    reducers: {
      superAdminsPermissions: ( state, action) => {
        state.superAdminsPermissions = action.payload.data.items
      },
      superAdminsPermissionsError: ( state, action) => {
        state.superAdminsPermissionsError = action.payload
      },
      superAdminsPermissionsBeauty: ( state, action) => {
        state.superAdminsPermissionsBeauty = action.payload
      },

      f5Permissions: ( state, action) => {
        state.f5Permissions = action.payload.data.items
      },
      fetchF5RolesError: ( state, action) => {
        state.fetchF5RolesError = action.payload
      },
      addNewDnError: ( state, action) => {
        state.addNewDnError = action.payload
      },
      addF5PermissionError: ( state, action) => {
        state.addF5PermissionError = action.payload
      },
      modifyF5PermissionError: ( state, action) => {
        state.modifyF5PermissionError = action.payload
      },
      deleteF5PermissionError: ( state, action) => {
        state.deleteF5PermissionError = action.payload
      },

      infobloxPermissions: ( state, action) => {
        state.infobloxPermissions = action.payload.data.items
      },
      fetchInfobloxRolesError: ( state, action) => {
        state.fetchInfobloxRolesError = action.payload
      },
      addInfobloxPermissionError: ( state, action) => {
        state.addInfobloxPermissionError = action.payload
      },
      modifyInfobloxPermissionError: ( state, action) => {
        state.modifyInfobloxPermissionError = action.payload
      },
      deleteInfobloxPermissionError: ( state, action) => {

        state.deleteInfobloxPermissionError = action.payload
      },
    }
})

const { actions, reducer } = permissionsSlice;

export const {
  superAdminsPermissions,
  superAdminsPermissionsError,
  superAdminsPermissionsBeauty,

  f5Permissions,
  fetchF5RolesError,
  addNewDnError,
  addF5PermissionError,
  modifyF5PermissionError,
  deleteF5PermissionError,

  infobloxPermissions,
  fetchInfobloxRolesError,
  addInfobloxPermissionError,
  modifyInfobloxPermissionError,
  deleteInfobloxPermissionError,
} = actions
export default reducer
