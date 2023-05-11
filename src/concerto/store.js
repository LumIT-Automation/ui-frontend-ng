import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const concertoSlice = createSlice({
    name: 'concerto',
    initialState: {},
    reducers: {

      configurations: ( state, action) => {
        state.configurations = action.payload.data.configuration
      },
      configurationsError: ( state, action) => {
        state.configurationsError = action.payload
      },

      historysLoading: ( state, action) => {
        state.historysLoading = action.payload
      },
      historys: ( state, action) => {
        state.historys = action.payload.data.items
      },
      historysError: ( state, action) => {
        state.historysError = action.payload
      },
      taskProgressLoading: ( state, action) => {
          state.taskProgressLoading = action.payload
      },
      secondStageProgressLoading: ( state, action) => {
        state.secondStageProgressLoading = action.payload
      },

      triggers: ( state, action) => {
        state.triggers = action.payload.data.items
      },
      triggersError: ( state, action) => {
        state.triggersError = action.payload
      },
      triggersFetch: (state, action) => {
        state.triggersFetch = action.payload
      },
      triggerAddError: ( state, action) => {
        state.triggerAddError = action.payload
      },
      triggerModifyError: ( state, action) => {
        state.triggerModifyError = action.payload
      },
      triggerDeleteError: ( state, action) => {
        state.triggerDeleteError = action.payload
      },

    }
})

const { actions, reducer } = concertoSlice;

export const {

  configurations,
  configurationsError,

  historysLoading,
  historys,
  historysError,

  taskProgressLoading,
  secondStageProgressLoading,

  triggers,
  triggersFetch,
  triggersError,
  
  triggerAddError,
  triggerModifyError,
  triggerDeleteError

} = actions

export default reducer
