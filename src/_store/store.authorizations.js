import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*

*/

const authorizationsSlice = createSlice({
    name: 'authorizations',
    initialState: {},
    reducers: {
      setAuthorizations: (state, action) => {
        for (const l in action.payload.data) {
          state[l] = action.payload.data[l].data.items
        }
      },
      setIdentityGroups: ( state, action) => {
        state.identityGroups = action.payload.data.items
      },
      setIgIdentifiers: ( state, action) => {
        let list = []
        for (const l in action.payload.data.items) {
          list.push(action.payload.data.items[l].identity_group_identifier)
        }
        state.igIdentifiers = list
      },
      setF5Permissions: ( state, action) => {
        state.f5Permissions = action.payload.data.items
      }
    }
})

const { actions, reducer } = authorizationsSlice;

export const { setAuthorizations, setIdentityGroups, setF5Permissions, setIgIdentifiers } = actions
export default reducer
