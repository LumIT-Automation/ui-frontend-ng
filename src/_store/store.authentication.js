import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*
createSlice creates a small piece of the store, in this case the slice for authentication.
It has a name, an initial state and two methods that set the status,
  login
  logout.
Methods (called actions) must be exported.
*/

const authenticationSlice = createSlice({
    name: 'authentication',
    initialState: {
        authenticated: false,
        username: "",
        token: ""
    },
    reducers: {
        login: (state, action) => {
          state.authenticated = action.payload.authenticated
          state.username = action.payload.username
          state.token = action.payload.token
        },
        uiconf: (state, action) => {
          state.logoWhite = action.payload.application.logo.white,
          state.banner = action.payload.page.banner
        },
        logout: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = authenticationSlice;

export const {
  login,
  uiconf,
  logout
} = actions
export default reducer
