import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const workflowSlice = createSlice({
    name: 'workflow',
    initialState: {},
    reducers: {
      environment: (state, action) => {
        state.environment = action.payload
      },
      environmentError: (state, action) => {
        state.environmentError = action.payload
      },

      workflowsLoading: (state, action) => {
        state.workflowsLoading = action.payload
      },
      workflows: (state, action) => {
        state.workflows = action.payload.data.items
      },
      workflowsFetch: (state, action) => {
        state.workflowsFetch = action.payload
      },
      workflowsError: (state, action) => {
        state.workflowsError = action.payload
      },

      workflow: (state, action) => {
        state.workflow = action.payload
      },
      workflowAddError: (state, action) => {
        state.workflowAddError = action.payload
      },
      workflowModifyError: (state, action) => {
        state.workflowModifyError = action.payload
      },
      workflowDeleteError: (state, action) => {
        state.workflowDeleteError = action.payload
      },

      hostRemoveError: (state, action) => {
        state.hostRemoveError = action.payload
      },
      hostAddError: (state, action) => {
        state.hostAddError = action.payload
      },

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
        state.historysError = action.payload
      },

      genericError: (state, action) => {
        state.genericError = action.payload
      },


      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = workflowSlice;

export const {
  environment,
  environmentError,

  workflowsLoading,
  workflows,
  workflowsFetch,
  workflowsError,

  workflow,
  workflowAddError,
  workflowModifyError,
  workflowDeleteError,

  hostRemoveError,
  hostAddError,

  historysLoading,
  historys,
  historysFetch,
  historysError,

  genericError,

  cleanUp
} = actions

export default reducer
