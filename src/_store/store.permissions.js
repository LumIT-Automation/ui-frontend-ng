import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*

*/

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState: {},
    reducers: {
      setSuperAdminsPermissions: ( state, action) => {
        state.superAdminsPermissions = action.payload.data.items
      },
      setSuperAdminsPermissionsBeauty: ( state, action) => {
        state.superAdminsPermissionsBeauty = action.payload
      },
      setF5Permissions: ( state, action) => {
        state.f5Permissions = action.payload.data.items
      },
      addF5PermissionError: ( state, action) => {
        state.addF5PermissionError = action.payload
      },
      setInfobloxPermissions: ( state, action) => {
        state.infobloxPermissions = action.payload.data.items
      },
    }
})

const { actions, reducer } = permissionsSlice;

export const {
  setSuperAdminsPermissions,
  setSuperAdminsPermissionsBeauty,
  setF5Permissions,
  addF5PermissionError,
  setInfobloxPermissions,
} = actions
export default reducer
