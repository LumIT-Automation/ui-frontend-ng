import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const concertoSlice = createSlice({
    name: 'concerto',
    initialState: {},
    reducers: {

      historysLoading: ( state, action) => {
        state.historysLoading = action.payload
      },
      historys: ( state, action) => {
        state.historys = action.payload.data.items
      },
      historysFetch: ( state, action) => {
        state.historysFetch = action.payload
      },
      historysError: ( state, action) => {
        console.log(action.payload)
        state.historysError = action.payload
      }

    }
})

const { actions, reducer } = concertoSlice;

export const {

  historysLoading,
  historys,
  historysFetch,
  historysError

} = actions

export default reducer
