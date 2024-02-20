import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const workflowSlice = createSlice({
    name: 'workflow',
    initialState: {},
    reducers: {
      environment: (state, action) => {
        state.environment = action.payload
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

      workflow: (state, action) => {
        state.workflow = action.payload
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

  workflowsLoading,
  workflows,
  workflowsFetch,

  workflow,

  historysLoading,
  historys,
  historysFetch,

  cleanUp
} = actions

export default reducer
