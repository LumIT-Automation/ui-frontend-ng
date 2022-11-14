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
        username: "",
        token: ""
    },
    reducers: {
        login: (state, action) => {
          console.log('login')
          state.username = action.payload.username
          state.token = action.payload.token
        },
        uiconf: (state, action) => {
          if (action.payload.application.logo.white) {
            state.logoWhite = action.payload.application.logo.white
          }
          if (action.payload.application.image) {
            state.image = action.payload.application.image
          }
          if (action.payload.page.banner) {
            state.banner = action.payload.page.banner
          }
          if (action.payload.page.headerColor) {
            state.headerColor = action.payload.page.headerColor
          }
        },
        logout: (state, action) => {
          for (const l in state) {
            delete state[l]
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
