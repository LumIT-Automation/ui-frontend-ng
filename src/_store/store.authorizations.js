import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*

*/

const authorizationsSlice = createSlice({
    name: 'authorizations',
    initialState: {},
    reducers: {

      authorizations: (state, action) => {
        console.log('store - authorizations: ', action.payload)
        for (const l in action.payload.data) {
          state[l] = action.payload.data[l].data.items
        }
      },
      authorizationsError: (state, action) => {
        state.authorizationsError = action.payload
      },


      superAdminPermissions: ( state, action) => {
        state.superAdminPermissions = action.payload.data.items
      },
      superAdminPermissionsError: ( state, action) => {
        state.superAdminPermissionsError = action.payload
      },
      superAdminPermissionsBeauty: ( state, action) => {
        state.superAdminPermissionsBeauty = action.payload
      },


      identityGroups: ( state, action) => {
        state.identityGroups = action.payload.data.items
      },
      setIgIdentifiers: ( state, action) => {
        let list = []
        for (const l in action.payload.data.items) {
          list.push(action.payload.data.items[l].identity_group_identifier)
        }
        state.igIdentifiers = list
      },
    }
})

const { actions, reducer } = authorizationsSlice;

export const {
  authorizations,
  authorizationsError,

  superAdminPermissions,
  superAdminPermissionsError,
  superAdminPermissionsBeauty,

  identityGroups,
  setIgIdentifiers
} = actions
export default reducer
