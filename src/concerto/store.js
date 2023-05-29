import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const concertoSlice = createSlice({
    name: 'concerto',
    initialState: {},
    reducers: {

      assetsError: ( state, action) => {
        state.assetsError = action.payload
      },
      subAssetsError: ( state, action) => {
        state.subAssetsError = action.payload
      },
      networksError: ( state, action) => {
        state.networksError = action.payload
      },
      containersError: ( state, action) => {
        state.containersError = action.payload
      },

      permissionsError: ( state, action) => {
        state.permissionsError = action.payload
      },
      identityGroupsError: ( state, action) => {
        state.identityGroupsError = action.payload
      },
      rolesError: ( state, action) => {
        state.rolesError = action.payload
      },

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

      triggersFetch: (state, action) => {
        state.triggersFetch = action.payload
      },
      triggersError: ( state, action) => {
        state.triggersError = action.payload
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
      conditionAddError: ( state, action) => {
        state.conditionAddError = action.payload
      },
      conditionDeleteError: ( state, action) => {
        state.conditionDeleteError = action.payload
      },

    }
})

const { actions, reducer } = concertoSlice;

export const {

  assetsError,
  subAssetsError,
  networksError,
  containersError,

  permissionsError,
  identityGroupsError,
  rolesError,

  configurations,
  configurationsError,

  historysLoading,
  historys,
  historysError,

  taskProgressLoading,
  secondStageProgressLoading,

  triggersFetch,
  triggersError,

  triggerAddError,
  triggerModifyError,
  triggerDeleteError,
  conditionAddError,
  conditionDeleteError

} = actions

export default reducer
