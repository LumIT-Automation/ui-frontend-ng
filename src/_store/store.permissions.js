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
      setF5PermissionsBeauty: ( state, action) => {
        state.f5PermissionsBeauty = action.payload
      },
      setInfobloxPermissions: ( state, action) => {
        state.infobloxPermissions = action.payload.data.items
      },
      setInfobloxPermissionsBeauty: ( state, action) => {
        state.infobloxPermissionsBeauty = action.payload
      }
    }
})

const { actions, reducer } = permissionsSlice;

export const {
  setSuperAdminsPermissions,
  setSuperAdminsPermissionsBeauty,
  setF5Permissions,
  setF5PermissionsBeauty,
  setInfobloxPermissions,
  setInfobloxPermissionsBeauty
} = actions
export default reducer
